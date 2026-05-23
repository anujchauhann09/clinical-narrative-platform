import { COOKIE_NAMES } from '../constants/cookies.js';
import { env } from '../config/env.js';


const isProduction = env.NODE_ENV === 'production';

const cookiePolicy = (_req, path, maxAge) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path,
  maxAge,
});

const accessCookiePath = env.API_PREFIX;
const refreshCookiePath = `${env.API_PREFIX}/auth`;
const csrfCookiePath = '/';

export const setAccessTokenCookie = (req, res, accessToken, maxAge) => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookiePolicy(req, accessCookiePath, maxAge));
};

export const setRefreshTokenCookie = (req, res, refreshToken, maxAge) => {
  res.cookie(
    COOKIE_NAMES.REFRESH_TOKEN,
    refreshToken,
    cookiePolicy(req, refreshCookiePath, maxAge),
  );
};

export const setCsrfTokenCookie = (req, res, token, maxAge) => {
  res.cookie(COOKIE_NAMES.CSRF_TOKEN, token, {
    ...cookiePolicy(req, csrfCookiePath, maxAge),
    httpOnly: false,
  });
};

export const clearAccessTokenCookie = (req, res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, cookiePolicy(req, accessCookiePath, 0));
};

export const clearRefreshTokenCookie = (req, res) => {
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, cookiePolicy(req, refreshCookiePath, 0));
};

export const clearCsrfTokenCookie = (req, res) => {
  res.clearCookie(COOKIE_NAMES.CSRF_TOKEN, {
    ...cookiePolicy(req, csrfCookiePath, 0),
    httpOnly: false,
  });
};

export const clearAuthCookies = (req, res) => {
  clearAccessTokenCookie(req, res);
  clearRefreshTokenCookie(req, res);
  clearCsrfTokenCookie(req, res);
};
