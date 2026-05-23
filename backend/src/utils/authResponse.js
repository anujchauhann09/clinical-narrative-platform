import { ApiResponse } from './apiResponse.js';
import {
  setAccessTokenCookie,
  setCsrfTokenCookie,
  setRefreshTokenCookie,
} from './authCookies.js';
import { generateCsrfToken } from './csrf.js';

export const sendAuthSession = (req, res, statusCode, session, message) => {
  setRefreshTokenCookie(req, res, session.refreshToken, session.refreshTokenTtlMs);
  setAccessTokenCookie(req, res, session.accessToken, session.accessTokenTtlMs);

  const csrfToken = generateCsrfToken();
  setCsrfTokenCookie(req, res, csrfToken, session.refreshTokenTtlMs);

  res.status(statusCode).json(
    ApiResponse.success({
      message,
      data: {
        user: session.user,
        csrfToken,
      },
    }),
  );
};
