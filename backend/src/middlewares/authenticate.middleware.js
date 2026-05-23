import { AUTH_SCHEMES } from '../constants/auth.js';
import { COOKIE_NAMES } from '../constants/cookies.js';
import { AuthError } from '../errors/index.js';
import { tokenService } from '../services/token.service.js';

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== AUTH_SCHEMES.BEARER || !token) return null;

  return token;
};

const extractAccessToken = (req) => {
  const cookieToken = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
  if (cookieToken) return cookieToken;
  return extractBearerToken(req.headers.authorization);
};

export const authenticate = (req, _res, next) => {
  const token = extractAccessToken(req);

  if (!token) {
    next(new AuthError('Missing access token'));
    return;
  }

  try {
    req.auth = tokenService.verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
};
