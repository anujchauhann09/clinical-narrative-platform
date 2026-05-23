import { COOKIE_NAMES } from '../constants/cookies.js';
import { env } from '../config/env.js';


const isProd = env.NODE_ENV === 'production';

const baseCookieOptions = (path, maxAge) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'strict',
  path,
  maxAge,
});

const accessCookiePath = env.API_PREFIX;
const refreshCookiePath = `${env.API_PREFIX}/auth`;
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
