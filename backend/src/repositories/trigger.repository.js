import { prisma } from '../database/prisma.js';

export const triggerRepository = {
  listAll() {
    return prisma.trigger.findMany({
      orderBy: { name: 'asc' },
    });
  },

  findIdsByPublicIds(publicIds) {
    return prisma.trigger.findMany({
      where: { publicId: { in: publicIds } },
      select: { id: true, publicId: true },
    });
  },
};
