import { AUTH_SCHEMES } from '../constants/auth.js';
import { AuthError } from '../errors/index.js';
import { tokenService } from '../services/token.service.js';

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader) return null;

  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== AUTH_SCHEMES.BEARER || !token) return null;

  return token;
};

export const authenticate = (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);

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
