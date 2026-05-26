import { frontendUrl } from '../config/env.js';
import { COOKIE_NAMES } from '../constants/cookies.js';
import { OAUTH_MESSAGES } from '../constants/oauth.js';
import { ApiError } from '../errors/index.js';
import { auditService, AUDIT_ACTIONS } from '../services/audit.service.js';
import { oauthService } from '../services/oauth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  clearOAuthStateCookie,
  setAccessTokenCookie,
  setCsrfTokenCookie,
  setOAuthStateCookie,
  setRefreshTokenCookie,
} from '../utils/authCookies.js';
import { csrfTokensMatch, generateCsrfToken } from '../utils/csrf.js';
import { logger } from '../utils/logger.js';


const FRONTEND_RESULT_PATH = '/auth/oauth/callback';
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000; 

const redirectToFrontend = (res, { error } = {}) => {
  const base = `${frontendUrl}${FRONTEND_RESULT_PATH}`;
  const target = error ? `${base}?error=${encodeURIComponent(error)}` : base;
  return res.redirect(target);
};

const toUserSafeMessage = (err) =>
  err instanceof ApiError ? err.message : OAUTH_MESSAGES.PROVIDER_FAILED;


export const redirectToProvider = asyncHandler(async (req, res) => {
  const { provider } = req.params;

  try {
    const state = generateCsrfToken();
    setOAuthStateCookie(req, res, state, OAUTH_STATE_TTL_MS);

    const authorizationUrl = oauthService.getAuthorizationUrl(provider, state);
    return res.redirect(authorizationUrl);
  } catch (err) {
    logger.warn({ err, provider }, 'OAuth authorization start failed');
    return redirectToFrontend(res, { error: toUserSafeMessage(err) });
  }
});


export const handleCallback = asyncHandler(async (req, res) => {
  const { provider } = req.params;
  const { code, state, error: providerError } = req.query;

  const stateCookie = req.cookies?.[COOKIE_NAMES.OAUTH_STATE];
  clearOAuthStateCookie(req, res);

  try {
    if (providerError) {
      throw new ApiError(OAUTH_MESSAGES.MISSING_CODE);
    }

    if (!stateCookie || !state || !csrfTokensMatch(stateCookie, String(state))) {
      throw new ApiError(OAUTH_MESSAGES.STATE_MISMATCH);
    }

    const session = await oauthService.handleCallback(provider, code);

    setRefreshTokenCookie(req, res, session.refreshToken, session.refreshTokenTtlMs);
    setAccessTokenCookie(req, res, session.accessToken, session.accessTokenTtlMs);
    setCsrfTokenCookie(req, res, generateCsrfToken(), session.refreshTokenTtlMs);

    auditService.emit({
      userPublicId: session.user.publicId,
      action: AUDIT_ACTIONS.AUTH_LOGIN_SUCCESS,
      resourceType: 'user',
      resourceId: session.user.publicId,
      req,
      metadata: { method: 'oauth', provider },
    });

    return redirectToFrontend(res);
  } catch (err) {
    logger.warn({ err, provider }, 'OAuth callback failed');
    return redirectToFrontend(res, { error: toUserSafeMessage(err) });
  }
});
