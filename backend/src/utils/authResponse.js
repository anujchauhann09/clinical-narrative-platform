import { ApiResponse } from './apiResponse.js';
import { setRefreshTokenCookie } from './refreshTokenCookie.js';

export const sendAuthSession = (res, statusCode, session, message) => {
  setRefreshTokenCookie(res, session.refreshToken, session.refreshTokenTtlMs);

  res.status(statusCode).json(
    ApiResponse.success({
      message,
      data: {
        user: session.user,
        accessToken: session.accessToken,
      },
    }),
  );
};
