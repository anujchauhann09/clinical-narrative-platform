import { prisma } from '../database/prisma.js';

const defaultUserInclude = {
  profile: true,
  role: true,
};

export const userRepository = {
  findByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: defaultUserInclude,
    });
  },

  findByPublicId(publicId) {
    return prisma.user.findUnique({
      where: { publicId },
      include: defaultUserInclude,
    });
  },

  createWithProfile({ email, name, passwordHash }) {
    return prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            name,
          },
        },
      },
      include: defaultUserInclude,
    });
  },

  updateProfileByUserPublicId(publicId, data) {
    return prisma.user.update({
      where: { publicId },
      data: {
        profile: {
          update: data,
        },
      },
      include: defaultUserInclude,
    });
  },

  deleteByPublicId(publicId) {
    return prisma.user.delete({ where: { publicId } });
  },

  // Lockout primitives. Kept here so the auth service stays declarative and
  // the locking policy is hot-swappable in one file.
  incrementFailedAttempts(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: { failedLoginAttempts: { increment: 1 } },
      select: { failedLoginAttempts: true },
    });
  },

  lockAccountUntil(userId, lockedUntil) {
    return prisma.user.update({
      where: { id: userId },
      data: { lockedUntil, failedLoginAttempts: 0 },
    });
  },

  recordSuccessfulLogin(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });
  },
};
