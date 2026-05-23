import { COOKIE_NAMES, CSRF_HEADER_NAME } from '../constants/cookies.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { csrfTokensMatch } from '../utils/csrf.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);


const EXEMPT_PATHS = new Set([
  '/auth/signup',
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
]);

const isExempt = (req) => {
  if (SAFE_METHODS.has(req.method)) return true;
  const path = req.path || req.originalUrl || '';
  return EXEMPT_PATHS.has(path);
};

export const csrfProtection = (req, _res, next) => {
  if (isExempt(req)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[COOKIE_NAMES.CSRF_TOKEN];
  const headerToken = req.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken || !csrfTokensMatch(cookieToken, headerToken)) {
    next(new ApiError('CSRF token missing or invalid', HTTP_STATUS.FORBIDDEN));
    return;
  }
  next();
};
