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

const buildListWhere = (userPublicId, filters = {}) => {
  const where = ownedEntryFilter(userPublicId);

  if (filters.from || filters.to) {
    where.loggedAt = {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    };
  }

  if (filters.severityMin !== undefined || filters.severityMax !== undefined) {
    where.severity = {
      ...(filters.severityMin !== undefined ? { gte: filters.severityMin } : {}),
      ...(filters.severityMax !== undefined ? { lte: filters.severityMax } : {}),
    };
  }

  if (filters.mood) {
    where.mood = { contains: filters.mood, mode: 'insensitive' };
  }

  if (filters.search) {
    where.notes = { contains: filters.search, mode: 'insensitive' };
  }

  if (filters.symptomIds?.length) {
    where.symptoms = {
      some: { symptom: { publicId: { in: filters.symptomIds } } },
    };
  }

  if (filters.triggerIds?.length) {
    where.triggers = {
      some: { trigger: { publicId: { in: filters.triggerIds } } },
    };
  }

  return where;
};

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

  listForUser({ userPublicId, pageSize, cursorId, sortBy, sortOrder, filters }) {
    const where = buildListWhere(userPublicId, filters);
    const orderBy = [{ [sortBy]: sortOrder }, { id: sortOrder }];

    return prisma.symptomEntry.findMany({
      where,
      orderBy,
      take: pageSize,
      ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {}),
      include: defaultEntryInclude,
    });
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
