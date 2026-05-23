import { ApiResponse } from './apiResponse.js';
import {
  setAccessTokenCookie,
  setCsrfTokenCookie,
  setRefreshTokenCookie,
} from './authCookies.js';
import { generateCsrfToken } from './csrf.js';

export const sendAuthSession = (res, statusCode, session, message) => {
  setRefreshTokenCookie(res, session.refreshToken, session.refreshTokenTtlMs);
  setAccessTokenCookie(res, session.accessToken, session.accessTokenTtlMs);

  // Rotate the CSRF token on every session-issuing call (login + refresh) so
  // a leaked-but-stale token has the shortest possible window.
  setCsrfTokenCookie(res, generateCsrfToken(), session.refreshTokenTtlMs);

  res.status(statusCode).json(
    ApiResponse.success({
      message,
      data: {
        user: session.user,
      },
    }),
  );
};
