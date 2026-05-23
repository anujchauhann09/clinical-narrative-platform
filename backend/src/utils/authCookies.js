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
// CSRF cookie must be readable by frontend JS on every page route — not just
// pages under /api/v1 — because the frontend lives at /, /dashboard, /profile,
// etc. and reads document.cookie to mirror the value into the X-CSRF-Token
// header. The browser only exposes cookies whose `path` prefixes the current
// page URL, so this one has to be `/`. It's still SameSite=Strict + Secure-in-
// prod, so a third-party page can't read it cross-site.
const csrfCookiePath = '/';

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
// echoes it into an X-CSRF-Token header (double-submit cookie pattern).
export const setCsrfTokenCookie = (res, token, maxAge) => {
  res.cookie(COOKIE_NAMES.CSRF_TOKEN, token, {
    ...baseCookieOptions(csrfCookiePath, maxAge),
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
    ...baseCookieOptions(csrfCookiePath, 0),
    httpOnly: false,
  });
};

export const clearAuthCookies = (res) => {
  clearAccessTokenCookie(res);
  clearRefreshTokenCookie(res);
  clearCsrfTokenCookie(res);
};
