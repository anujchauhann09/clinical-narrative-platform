import { COOKIE_NAMES } from '../constants/cookies.js';
import { env } from '../config/env.js';

const baseCookieOptions = (path, maxAge) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  path,
  maxAge,
});

const accessCookiePath = env.API_PREFIX;
const refreshCookiePath = `${env.API_PREFIX}/auth`;

export const setAccessTokenCookie = (res, accessToken, maxAge) => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, baseCookieOptions(accessCookiePath, maxAge));
};

export const setRefreshTokenCookie = (res, refreshToken, maxAge) => {
  res.cookie(
    COOKIE_NAMES.REFRESH_TOKEN,
    refreshToken,
    baseCookieOptions(refreshCookiePath, maxAge),
  );
};

// CSRF cookie is intentionally NOT HttpOnly: the frontend JS reads it and
// echoes it into an X-CSRF-Token header (double-submit cookie pattern). It
// stays SameSite=Strict + Secure-in-prod so a third party can't read it.
export const setCsrfTokenCookie = (res, token, maxAge) => {
  res.cookie(COOKIE_NAMES.CSRF_TOKEN, token, {
    ...baseCookieOptions(accessCookiePath, maxAge),
    httpOnly: false,
  });
};

export const clearAccessTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, baseCookieOptions(accessCookiePath, 0));
};

export const clearRefreshTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, baseCookieOptions(refreshCookiePath, 0));
};

export const clearCsrfTokenCookie = (res) => {
  res.clearCookie(COOKIE_NAMES.CSRF_TOKEN, {
    ...baseCookieOptions(accessCookiePath, 0),
    httpOnly: false,
  });
};

export const clearAuthCookies = (res) => {
  clearAccessTokenCookie(res);
  clearRefreshTokenCookie(res);
  clearCsrfTokenCookie(res);
};
