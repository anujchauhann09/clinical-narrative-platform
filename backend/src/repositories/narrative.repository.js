import { prisma } from '../database/prisma.js';

const defaultEntryInclude = {
  symptoms: { include: { symptom: true } },
  triggers: { include: { trigger: true } },
};

const ownedEntryFilter = (userPublicId, extra = {}) => ({
  user: { publicId: userPublicId },
  ...extra,
});

export const narrativeRepository = {
  listEntriesForWindow({ userPublicId, from, to, limit = 60 }) {
    const where = ownedEntryFilter(userPublicId);

    if (from || to) {
      where.loggedAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    return prisma.symptomEntry.findMany({
      where,
      orderBy: [{ loggedAt: 'desc' }, { id: 'desc' }],
      take: limit,
      include: defaultEntryInclude,
    });
  },

  saveSummary({ userPublicId, summaryType, content }) {
    return prisma.aiSummary.create({
      data: {
        summaryType,
        content,
        user: { connect: { publicId: userPublicId } },
      },
      select: {
        publicId: true,
        summaryType: true,
        content: true,
        generatedAt: true,
      },
    });
  },

  listSummariesForUser({ userPublicId, summaryType, limit = 10 }) {
    return prisma.aiSummary.findMany({
      where: {
        user: { publicId: userPublicId },
        ...(summaryType ? { summaryType } : {}),
      },
      orderBy: [{ generatedAt: 'desc' }, { id: 'desc' }],
      take: limit,
      select: {
        publicId: true,
        summaryType: true,
        content: true,
        generatedAt: true,
      },
    });
  },
};
