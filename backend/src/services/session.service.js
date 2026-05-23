import { env } from '../config/env.js';
import { refreshTokenRepository } from '../repositories/refreshToken.repository.js';
import { buildAuthTokenPayload } from '../utils/authTokenPayload.js';
import { durationToMs } from '../utils/duration.js';
import { hashToken } from '../utils/hashToken.js';
import { serializeUser } from '../utils/userSerializer.js';
import { tokenService } from './token.service.js';

export const sessionService = {
  async createSession(user) {
    const tokenPayload = buildAuthTokenPayload(user);
    const accessToken = tokenService.generateAccessToken(tokenPayload);
    const refreshToken = tokenService.generateRefreshToken(tokenPayload);
    const accessTokenTtlMs = durationToMs(env.JWT_ACCESS_EXPIRES_IN);
    const refreshTokenTtlMs = durationToMs(env.JWT_REFRESH_EXPIRES_IN);

    await refreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshTokenTtlMs),
    });

    return {
      user: serializeUser(user),
      accessToken,
      refreshToken,
      accessTokenTtlMs,
      refreshTokenTtlMs,
    };
  },
};
