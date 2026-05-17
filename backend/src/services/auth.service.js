import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError, AuthError } from '../errors/index.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { hashToken } from '../utils/hashToken.js';
import { serializeUser } from '../utils/userSerializer.js';
import { passwordService } from './password.service.js';
import { sessionService } from './session.service.js';
import { tokenService } from './token.service.js';

export const authService = {
  async signup({ email, name, password }) {
    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw new ApiError('Email is already registered', HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await passwordService.hashPassword(password);
    const user = await userRepository.createWithProfile({ email, name, passwordHash });

    return serializeUser(user);
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new AuthError('Invalid email or password');
    }

    const isPasswordValid = await passwordService.comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AuthError('Invalid email or password');
    }

    return sessionService.createSession(user);
  },

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new AuthError('Missing refresh token');
    }

    tokenService.verifyRefreshToken(refreshToken);

    const tokenHash = hashToken(refreshToken);
    const storedToken = await refreshTokenRepository.findActiveByHash(tokenHash);

    if (!storedToken) {
      throw new AuthError('Invalid or expired refresh token');
    }

    await refreshTokenRepository.revokeByHash(tokenHash);
    return sessionService.createSession(storedToken.user);
  },

  async logout(refreshToken) {
    if (!refreshToken) return;

    await refreshTokenRepository.revokeByHash(hashToken(refreshToken));
  },

  async getCurrentUser(userPublicId) {
    const user = await userRepository.findByPublicId(userPublicId);

    if (!user) {
      throw new AuthError('Authenticated user no longer exists');
    }

    return serializeUser(user);
  },
};
