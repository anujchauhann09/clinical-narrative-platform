import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { symptomEntryRepository } from '../repositories/symptomEntry.repository.js';
import { symptomRepository } from '../repositories/symptom.repository.js';
import { triggerRepository } from '../repositories/trigger.repository.js';
import {
  serializeSymptom,
  serializeSymptomEntry,
  serializeTrigger,
} from '../utils/symptomEntrySerializer.js';
import { decodeTimelineCursor, encodeTimelineCursor } from '../utils/timelineCursor.js';

const resolvePublicIds = async ({ repository, publicIds, label }) => {
  if (!publicIds || publicIds.length === 0) return [];

  const unique = [...new Set(publicIds)];
  const rows = await repository.findIdsByPublicIds(unique);

  if (rows.length !== unique.length) {
    throw new ApiError(`One or more ${label}s could not be found`, HTTP_STATUS.BAD_REQUEST);
  }

  return rows.map((row) => row.id);
};

const assertEntryOwnership = async (userPublicId, publicId) => {
  const owned = await symptomEntryRepository.findInternalIdByPublicIdForUser({
    userPublicId,
    publicId,
  });

  if (!owned) {
    throw new ApiError('Symptom entry not found', HTTP_STATUS.NOT_FOUND);
  }

  return owned.id;
};

const startOfCurrentMonthUtc = () => {
  const date = new Date();
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const formatAverage = (value) => (value ? Number(value.toFixed(1)) : 0);

const buildTimelineFilters = (query) => ({
  from: query.from ? new Date(query.from) : undefined,
  to: query.to ? new Date(query.to) : undefined,
  severityMin: query.severityMin,
  severityMax: query.severityMax,
  mood: query.mood,
  search: query.search,
  symptomIds: query.symptomIds,
  triggerIds: query.triggerIds,
});

export const symptomEntryService = {
  async listSymptoms() {
    const symptoms = await symptomRepository.listAll();
    return symptoms.map(serializeSymptom);
  },

  async listTriggers() {
    const triggers = await triggerRepository.listAll();
    return triggers.map(serializeTrigger);
  },

  async createEntry(userPublicId, payload) {
    const symptomIds = await resolvePublicIds({
      repository: symptomRepository,
      publicIds: payload.symptomIds,
      label: 'symptom',
    });
    const triggerIds = await resolvePublicIds({
      repository: triggerRepository,
      publicIds: payload.triggerIds ?? [],
      label: 'trigger',
    });

    const entry = await symptomEntryRepository.create({
      userPublicId,
      severity: payload.severity,
      mood: payload.mood ?? null,
      notes: payload.notes ?? null,
      loggedAt: new Date(payload.loggedAt),
      symptomIds,
      triggerIds,
    });

    return serializeSymptomEntry(entry);
  },

  async listEntries(userPublicId, query) {
    const cursorId = query.cursor ? decodeTimelineCursor(query.cursor) : undefined;
    const pageSize = query.pageSize;

    const entries = await symptomEntryRepository.listForUser({
      userPublicId,
      pageSize,
      cursorId,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      filters: buildTimelineFilters(query),
    });

    const items = entries.map(serializeSymptomEntry);
    const nextCursor =
      entries.length === pageSize ? encodeTimelineCursor(entries[entries.length - 1].id) : null;

    return { items, nextCursor };
  },

  async getEntry(userPublicId, publicId) {
    const entry = await symptomEntryRepository.findByPublicIdForUser({ userPublicId, publicId });

    if (!entry) {
      throw new ApiError('Symptom entry not found', HTTP_STATUS.NOT_FOUND);
    }

    return serializeSymptomEntry(entry);
  },

  async updateEntry(userPublicId, publicId, payload) {
    const entryId = await assertEntryOwnership(userPublicId, publicId);

    const symptomIds = payload.symptomIds
      ? await resolvePublicIds({
          repository: symptomRepository,
          publicIds: payload.symptomIds,
          label: 'symptom',
        })
      : undefined;
    const triggerIds = payload.triggerIds
      ? await resolvePublicIds({
          repository: triggerRepository,
          publicIds: payload.triggerIds,
          label: 'trigger',
        })
      : undefined;

    const updated = await symptomEntryRepository.update({
      id: entryId,
      severity: payload.severity,
      mood: payload.mood,
      notes: payload.notes,
      loggedAt: payload.loggedAt ? new Date(payload.loggedAt) : undefined,
      symptomIds,
      triggerIds,
    });

    return serializeSymptomEntry(updated);
  },

  async deleteEntry(userPublicId, publicId) {
    const entryId = await assertEntryOwnership(userPublicId, publicId);
    await symptomEntryRepository.deleteById(entryId);
  },

  async getSummary(userPublicId) {
    const [monthly, allTime] = await Promise.all([
      symptomEntryRepository.countsForUser({ userPublicId, since: startOfCurrentMonthUtc() }),
      symptomEntryRepository.countsForUser({ userPublicId }),
    ]);

    return {
      entriesThisMonth: monthly._count._all,
      averageSeverityThisMonth: formatAverage(monthly._avg.severity),
      totalEntries: allTime._count._all,
      averageSeverity: formatAverage(allTime._avg.severity),
    };
  },
};
