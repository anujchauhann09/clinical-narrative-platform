import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError, AuthError } from '../errors/index.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { hashToken } from '../utils/hashToken.js';
import { logger } from '../utils/logger.js';
import { serializeUser } from '../utils/userSerializer.js';
import { passwordService } from './password.service.js';
import { sessionService } from './session.service.js';
import { tokenService } from './token.service.js';

// Per-account lockout policy. Held here (not in env) for now since these are
// security parameters we'd rather change via code review than via runtime config.
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

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

    // We always compare a password (real or dummy) to keep response timing
    // consistent between "user does not exist" and "wrong password", and to
    // avoid an account-existence oracle.
    if (!user) {
      await passwordService.comparePassword(password, '$2b$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvali');
      throw new AuthError('Invalid email or password');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.max(
        1,
        Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000),
      );
      throw new AuthError(
        `Account locked due to repeated failed sign-ins. Try again in about ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
      );
    }

    const isPasswordValid = await passwordService.comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      const { failedLoginAttempts } = await userRepository.incrementFailedAttempts(user.id);
      if (failedLoginAttempts >= LOCKOUT_THRESHOLD) {
        await userRepository.lockAccountUntil(user.id, new Date(Date.now() + LOCKOUT_DURATION_MS));
        logger.warn({ userId: user.publicId }, 'Account locked after repeated failed sign-ins');
      }
      throw new AuthError('Invalid email or password');
    }

    await userRepository.recordSuccessfulLogin(user.id);
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
