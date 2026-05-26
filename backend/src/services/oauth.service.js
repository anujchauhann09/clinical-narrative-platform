import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import {
  GOOGLE_ENDPOINTS,
  GOOGLE_SCOPES,
  OAUTH_MESSAGES,
  OAUTH_PROVIDERS,
  OAUTH_PROVIDER_KEYS,
} from '../constants/oauth.js';
import { ApiError } from '../errors/index.js';
import { oauthAccountRepository } from '../repositories/oauthAccount.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { logger } from '../utils/logger.js';
import { sessionService } from './session.service.js';

const PROVIDER_REQUEST_TIMEOUT_MS = 10_000;

const assertProviderSupported = (provider) => {
  if (provider !== OAUTH_PROVIDERS.GOOGLE) {
    throw new ApiError(OAUTH_MESSAGES.INVALID_PROVIDER, HTTP_STATUS.BAD_REQUEST);
  }
};

const assertGoogleConfigured = () => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_CALLBACK_URL) {
    logger.error('Google OAuth invoked but GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL are not set');
    throw new ApiError(OAUTH_MESSAGES.NOT_CONFIGURED, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }
};

const requestProvider = async (url, init, context) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROVIDER_REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    logger.error({ err: error, context }, 'OAuth provider request failed');
    throw new ApiError(OAUTH_MESSAGES.PROVIDER_FAILED, HTTP_STATUS.BAD_GATEWAY);
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    logger.error({ status: response.status, payload, context }, 'OAuth provider returned an error');
    throw new ApiError(OAUTH_MESSAGES.PROVIDER_FAILED, HTTP_STATUS.UNAUTHORIZED);
  }

  return payload;
};

const getGoogleUser = async (code) => {
  const tokenPayload = await requestProvider(
    GOOGLE_ENDPOINTS.TOKEN,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: env.GOOGLE_CALLBACK_URL,
      }),
    },
    'google.token',
  );

  const accessToken = tokenPayload?.access_token;
  if (!accessToken) {
    throw new ApiError(OAUTH_MESSAGES.PROVIDER_FAILED, HTTP_STATUS.UNAUTHORIZED);
  }

  const profile = await requestProvider(
    GOOGLE_ENDPOINTS.USERINFO,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    'google.userinfo',
  );

  return {
    providerUserId: profile?.id,
    email: profile?.email,
    emailVerified: profile?.verified_email === true,
    name: profile?.name,
    avatar: profile?.picture,
  };
};

class OAuthService {
  getAuthorizationUrl(provider, state) {
    assertProviderSupported(provider);
    assertGoogleConfigured();

    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: env.GOOGLE_CALLBACK_URL,
      response_type: 'code',
      scope: GOOGLE_SCOPES,
      state,
      prompt: 'select_account',
    });

    return `${GOOGLE_ENDPOINTS.AUTH}?${params.toString()}`;
  }

  async handleCallback(provider, code) {
    assertProviderSupported(provider);
    assertGoogleConfigured();

    if (!code) {
      throw new ApiError(OAUTH_MESSAGES.MISSING_CODE, HTTP_STATUS.BAD_REQUEST);
    }

    const oauthUser = await getGoogleUser(code);

    if (!oauthUser?.email || !oauthUser?.providerUserId || !oauthUser?.emailVerified) {
      throw new ApiError(OAUTH_MESSAGES.PROVIDER_FAILED, HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await this.resolveUser(oauthUser);
    return sessionService.createSession(user);
  }

  async resolveUser(oauthUser) {
    const providerKey = OAUTH_PROVIDER_KEYS.GOOGLE;

    const existingAccount = await oauthAccountRepository.findByProviderAccount(
      providerKey,
      oauthUser.providerUserId,
    );

    if (existingAccount) {
      return existingAccount.user;
    }

    let user = await userRepository.findByEmail(oauthUser.email);

    if (!user) {
      user = await userRepository.createOAuthUser({
        email: oauthUser.email,
        name: oauthUser.name?.trim() || oauthUser.email.split('@')[0],
      });
    }

    await oauthAccountRepository.create({
      provider: providerKey,
      providerUserId: oauthUser.providerUserId,
      userId: user.id,
      email: oauthUser.email,
      avatarUrl: oauthUser.avatar,
    });

    return user;
  }
}

export const oauthService = new OAuthService();
