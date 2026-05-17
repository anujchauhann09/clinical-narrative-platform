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
};
