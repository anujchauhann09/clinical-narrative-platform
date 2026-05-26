import { COOKIE_NAMES } from '../constants/cookies.js';

const isProduction = process.env.NODE_ENV === 'production';

const tokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

const csrfCookieOptions = {
  httpOnly: false,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

export const setAccessTokenCookie = (_req, res, accessToken, maxAge) => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, { ...tokenCookieOptions, maxAge });
};

export const setRefreshTokenCookie = (_req, res, refreshToken, maxAge) => {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, { ...tokenCookieOptions, maxAge });
};

export const setCsrfTokenCookie = (_req, res, token, maxAge) => {
  res.cookie(COOKIE_NAMES.CSRF_TOKEN, token, { ...csrfCookieOptions, maxAge });
};

export const setOAuthStateCookie = (_req, res, state, maxAge) => {
  res.cookie(COOKIE_NAMES.OAUTH_STATE, state, { ...tokenCookieOptions, maxAge });
};

export const clearOAuthStateCookie = (_req, res) => {
  res.clearCookie(COOKIE_NAMES.OAUTH_STATE, tokenCookieOptions);
};

export const clearAccessTokenCookie = (_req, res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, tokenCookieOptions);
};

export const clearRefreshTokenCookie = (_req, res) => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, tokenCookieOptions);
};

export const clearCsrfTokenCookie = (_req, res) => {
  res.clearCookie(COOKIE_NAMES.CSRF_TOKEN, csrfCookieOptions);
};

export const clearAuthCookies = (req, res) => {
  clearAccessTokenCookie(req, res);
  clearRefreshTokenCookie(req, res);
  clearCsrfTokenCookie(req, res);
};
