import { TOKEN_TYPES } from '../constants/auth.js';
import { signToken, verifyToken } from '../utils/token.js';


export const tokenService = {
  generateAccessToken(payload) {
    return signToken(payload, TOKEN_TYPES.ACCESS);
  },

  generateRefreshToken(payload) {
    return signToken(payload, TOKEN_TYPES.REFRESH);
  },

  verifyAccessToken(token) {
    return verifyToken(token, TOKEN_TYPES.ACCESS);
  },

  verifyRefreshToken(token) {
    return verifyToken(token, TOKEN_TYPES.REFRESH);
  },
};
