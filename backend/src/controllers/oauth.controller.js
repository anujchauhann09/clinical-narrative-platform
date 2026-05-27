import { frontendUrl } from '../config/env.js';
import { COOKIE_NAMES } from '../constants/cookies.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { OAUTH_MESSAGES } from '../constants/oauth.js';
import { ApiError, AuthError } from '../errors/index.js';
import { auditService, AUDIT_ACTIONS } from '../services/audit.service.js';
import { oauthService } from '../services/oauth.service.js';
import { oauthExchangeStore } from '../services/oauthExchange.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendAuthSession } from '../utils/authResponse.js';
import {
  clearOAuthStateCookie,
  setOAuthStateCookie,
} from '../utils/authCookies.js';
import { csrfTokensMatch, generateCsrfToken } from '../utils/csrf.js';
import { logger } from '../utils/logger.js';


const FRONTEND_RESULT_PATH = '/auth/oauth/callback';
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

const redirectToFrontend = (res, { error, code } = {}) => {
  const base = `${frontendUrl}${FRONTEND_RESULT_PATH}`;
  const params = new URLSearchParams();
  if (error) params.set('error', error);
  if (code) params.set('code', code);
  const query = params.toString();
  return res.redirect(query ? `${base}?${query}` : base);
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

    const exchangeCode = oauthExchangeStore.issue(session);

    auditService.emit({
      userPublicId: session.user.publicId,
      action: AUDIT_ACTIONS.AUTH_LOGIN_SUCCESS,
      resourceType: 'user',
      resourceId: session.user.publicId,
      req,
      metadata: { method: 'oauth', provider },
    });

    return redirectToFrontend(res, { code: exchangeCode });
  } catch (err) {
    logger.warn({ err, provider }, 'OAuth callback failed');
    return redirectToFrontend(res, { error: toUserSafeMessage(err) });
  }
});


export const exchangeOAuthCode = asyncHandler(async (req, res) => {
  const session = oauthExchangeStore.consume(req.validated.body.code);

  if (!session) {
    throw new AuthError(OAUTH_MESSAGES.EXCHANGE_FAILED);
  }

  sendAuthSession(req, res, HTTP_STATUS.OK, session, 'Signed in with Google');
});
