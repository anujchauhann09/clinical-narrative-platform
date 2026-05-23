import { randomUUID } from 'node:crypto';

import jwt from 'jsonwebtoken';

import { TOKEN_TYPES } from '../constants/auth.js';
import { env } from '../config/env.js';
import { AuthError } from '../errors/index.js';

const getSecretByTokenType = (tokenType) => {
  if (tokenType === TOKEN_TYPES.ACCESS) {
    return env.JWT_ACCESS_SECRET;
  }

  if (tokenType === TOKEN_TYPES.REFRESH) {
    return env.JWT_REFRESH_SECRET;
  }

  throw new AuthError('Unsupported token type');
};

const getExpiryByTokenType = (tokenType) => {
  if (tokenType === TOKEN_TYPES.ACCESS) {
    return env.JWT_ACCESS_EXPIRES_IN;
  }

  if (tokenType === TOKEN_TYPES.REFRESH) {
    return env.JWT_REFRESH_EXPIRES_IN;
  }

  throw new AuthError('Unsupported token type');
};

export const signToken = (payload, tokenType) =>
  jwt.sign(
    {
      data: payload,
      tokenType,
    },
    getSecretByTokenType(tokenType),
    {
      expiresIn: getExpiryByTokenType(tokenType),
      jwtid: randomUUID(),
    }
  );

export const verifyToken = (token, tokenType) => {
  try {
    const decodedToken = jwt.verify(
      token,
      getSecretByTokenType(tokenType)
    );

    if (decodedToken.tokenType !== tokenType) {
      throw new AuthError('Invalid token type');
    }

    return decodedToken.data;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }

    throw new AuthError('Invalid or expired token');
  }
};