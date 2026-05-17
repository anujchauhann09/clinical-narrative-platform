import { COOKIE_NAMES } from '../constants/cookies.js';
import { env } from '../config/env.js';

const getRefreshCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: `${env.API_PREFIX}/auth`,
  maxAge,
});

export const setRefreshTokenCookie = (res, refreshToken, maxAge) => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, getRefreshCookieOptions(maxAge));
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, getRefreshCookieOptions(0));
};
