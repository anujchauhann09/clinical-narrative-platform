import { prisma } from '../database/prisma.js';

export const oauthAccountRepository = {
  findByProviderAccount(provider, providerUserId) {
    return prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: { provider, providerUserId },
      },
      include: {
        user: {
          include: {
            profile: true,
            role: true,
          },
        },
      },
    });
  },

  create({ provider, providerUserId, userId, email, avatarUrl }) {
    return prisma.oAuthAccount.create({
      data: { provider, providerUserId, userId, email, avatarUrl },
    });
  },
};
