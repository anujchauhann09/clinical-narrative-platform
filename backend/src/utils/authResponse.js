import { ApiResponse } from './apiResponse.js';
import { setAccessTokenCookie, setRefreshTokenCookie } from './authCookies.js';

export const sendAuthSession = (res, statusCode, session, message) => {
  setRefreshTokenCookie(res, session.refreshToken, session.refreshTokenTtlMs);
  setAccessTokenCookie(res, session.accessToken, session.accessTokenTtlMs);

  res.status(statusCode).json(
    ApiResponse.success({
      message,
      data: {
        user: session.user,
      },
    }),
  );
};
