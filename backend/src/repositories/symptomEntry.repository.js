import { prisma } from '../database/prisma.js';

const defaultEntryInclude = {
  symptoms: {
    include: { symptom: true },
  },
  triggers: {
    include: { trigger: true },
  },
};

const ownedEntryFilter = (userPublicId, extra = {}) => ({
  user: { publicId: userPublicId },
  ...extra,
});

export const symptomEntryRepository = {
  create({ userPublicId, severity, mood, notes, loggedAt, symptomIds, triggerIds }) {
    return prisma.symptomEntry.create({
      data: {
        severity,
        mood,
        notes,
        loggedAt,
        user: { connect: { publicId: userPublicId } },
        symptoms: symptomIds.length
          ? { create: symptomIds.map((symptomId) => ({ symptomId })) }
          : undefined,
        triggers: triggerIds.length
          ? { create: triggerIds.map((triggerId) => ({ triggerId })) }
          : undefined,
      },
      include: defaultEntryInclude,
    });
  },

  findByPublicIdForUser({ userPublicId, publicId }) {
    return prisma.symptomEntry.findFirst({
      where: ownedEntryFilter(userPublicId, { publicId }),
      include: defaultEntryInclude,
    });
  },

  findInternalIdByPublicIdForUser({ userPublicId, publicId }) {
    return prisma.symptomEntry.findFirst({
      where: ownedEntryFilter(userPublicId, { publicId }),
      select: { id: true },
    });
  },

  listForUser({ userPublicId, page, pageSize, from, to }) {
    const where = ownedEntryFilter(userPublicId, {
      ...(from || to
        ? {
            loggedAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    });

    return prisma.$transaction([
      prisma.symptomEntry.findMany({
        where,
        orderBy: { loggedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: defaultEntryInclude,
      }),
      prisma.symptomEntry.count({ where }),
    ]);
  },

  countsForUser({ userPublicId, since }) {
    const where = ownedEntryFilter(userPublicId, since ? { loggedAt: { gte: since } } : {});

    return prisma.symptomEntry.aggregate({
      where,
      _count: { _all: true },
      _avg: { severity: true },
    });
  },

  update({ id, severity, mood, notes, loggedAt, symptomIds, triggerIds }) {
    return prisma.$transaction(async (tx) => {
      if (symptomIds) {
        await tx.entrySymptom.deleteMany({ where: { entryId: id } });
      }
      if (triggerIds) {
        await tx.entryTrigger.deleteMany({ where: { entryId: id } });
      }

      return tx.symptomEntry.update({
        where: { id },
        data: {
          ...(severity !== undefined ? { severity } : {}),
          ...(mood !== undefined ? { mood } : {}),
          ...(notes !== undefined ? { notes } : {}),
          ...(loggedAt !== undefined ? { loggedAt } : {}),
          ...(symptomIds
            ? {
                symptoms: {
                  create: symptomIds.map((symptomId) => ({ symptomId })),
                },
              }
            : {}),
          ...(triggerIds
            ? {
                triggers: {
                  create: triggerIds.map((triggerId) => ({ triggerId })),
                },
              }
            : {}),
        },
        include: defaultEntryInclude,
      });
    });
  },

  deleteById(id) {
    return prisma.symptomEntry.delete({ where: { id } });
  },
};
