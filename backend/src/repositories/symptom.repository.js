import { prisma } from '../database/prisma.js';

export const symptomRepository = {
  listAll() {
    return prisma.symptom.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  },

  findIdsByPublicIds(publicIds) {
    return prisma.symptom.findMany({
      where: { publicId: { in: publicIds } },
      select: { id: true, publicId: true },
    });
  },
};
