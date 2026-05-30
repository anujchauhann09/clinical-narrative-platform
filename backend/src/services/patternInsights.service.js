import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { patternInsightsRepository } from '../repositories/patternInsights.repository.js';
import { symptomEntryRepository } from '../repositories/symptomEntry.repository.js';
import { logger } from '../utils/logger.js';
import { patternDetector } from './patterns/patternDetection.service.js';

const LOOKBACK_DAYS = 60;

const fetchRecentEntries = async (userPublicId) => {
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000);
  return symptomEntryRepository.listForUser({
    userPublicId,
    pageSize: 500,
    sortBy: 'loggedAt',
    sortOrder: 'desc',
    filters: { from: since },
  });
};

const serialize = (row) => ({
  publicId: row.publicId,
  patternKey: row.patternKey,
  title: row.title,
  observation: row.observation,
  discussionTopics: Array.isArray(row.discussionTopics)
    ? row.discussionTopics
    : (row.discussionTopics ?? []),
  severity: row.severity,
  confidence: row.confidence,
  evidenceCount: row.evidenceCount,
  windowStart: row.windowStart,
  windowEnd: row.windowEnd,
  generatedAt: row.generatedAt,
  feedback: row.feedback ?? null,
});

export const patternInsightsService = {
  async refreshAndList(userPublicId) {
    if (!patternInsightsRepository.isReady()) {
      return {
        ready: false,
        reason: 'storage_not_ready',
        minimumEntries: patternDetector.MIN_TOTAL_ENTRIES,
        minimumDays: patternDetector.MIN_DAYS_SPAN,
        patterns: [],
      };
    }

    const entries = await fetchRecentEntries(userPublicId);
    const verdict = patternDetector.detect(entries);

    if (!verdict.eligible) {
      const existing = await patternInsightsRepository.listForUser(userPublicId);
      return {
        ready: false,
        reason: verdict.reason,
        minimumEntries: patternDetector.MIN_TOTAL_ENTRIES,
        minimumDays: patternDetector.MIN_DAYS_SPAN,
        patterns: existing.map(serialize),
      };
    }

    if (verdict.patterns.length > 0) {
      try {
        await patternInsightsRepository.upsertMany({
          userPublicId,
          patterns: verdict.patterns,
        });
      } catch (error) {
        logger.warn({ err: error }, 'PatternInsight upsert failed; serving in-memory results');
      }
    }

    const stored = await patternInsightsRepository.listForUser(userPublicId);
    return {
      ready: true,
      patterns: stored.map(serialize),
    };
  },

  async dismiss({ userPublicId, publicId }) {
    if (!publicId) throw new ApiError('publicId is required', HTTP_STATUS.BAD_REQUEST);
    const ok = await patternInsightsRepository.dismiss({ userPublicId, publicId });
    if (!ok) throw new ApiError('Pattern not found', HTTP_STATUS.NOT_FOUND);
    return true;
  },

  async submitFeedback({ userPublicId, publicId, feedback }) {
    const allowed = new Set(['helpful', 'not_helpful']);
    if (!allowed.has(feedback)) {
      throw new ApiError('Invalid feedback value', HTTP_STATUS.BAD_REQUEST);
    }
    const ok = await patternInsightsRepository.setFeedback({
      userPublicId,
      publicId,
      feedback,
    });
    if (!ok) throw new ApiError('Pattern not found', HTTP_STATUS.NOT_FOUND);
    return true;
  },
};
