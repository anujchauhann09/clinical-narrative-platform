import { prisma } from '../database/prisma.js';
import { logger } from '../utils/logger.js';


const isReady = () => Boolean(prisma?.patternInsight);

const safe = async (label, fn, fallback) => {
  if (!isReady()) return fallback;
  try {
    return await fn();
  } catch (error) {
    if (error?.code === 'P2021' || error?.code === 'P2022') {
      logger.warn({ err: error, label }, 'PatternInsight table not ready yet');
      return fallback;
    }
    throw error;
  }
};

const userIdFromPublicId = async (userPublicId) => {
  const user = await prisma.user.findUnique({
    where: { publicId: userPublicId },
    select: { id: true },
  });
  return user?.id ?? null;
};

export const patternInsightsRepository = {
  isReady,

  async listForUser(userPublicId) {
    return safe(
      'listForUser',
      async () =>
        prisma.patternInsight.findMany({
          where: {
            user: { publicId: userPublicId },
            dismissedAt: null,
          },
          orderBy: { generatedAt: 'desc' },
        }),
      [],
    );
  },

  async upsertMany({ userPublicId, patterns }) {
    if (!patterns?.length) return [];
    return safe(
      'upsertMany',
      async () => {
        const userId = await userIdFromPublicId(userPublicId);
        if (!userId) return [];
        const saved = [];
        for (const p of patterns) {
          const row = await prisma.patternInsight.upsert({
            where: {
              userId_patternKey_windowStart: {
                userId,
                patternKey: p.patternKey,
                windowStart: p.windowStart,
              },
            },
            create: {
              userId,
              patternKey: p.patternKey,
              title: p.title,
              observation: p.observation,
              discussionTopics: p.discussionTopics,
              severity: p.severity,
              confidence: p.confidence,
              evidenceCount: p.evidenceCount,
              windowStart: p.windowStart,
              windowEnd: p.windowEnd,
            },
            update: {
              title: p.title,
              observation: p.observation,
              discussionTopics: p.discussionTopics,
              severity: p.severity,
              confidence: p.confidence,
              evidenceCount: p.evidenceCount,
              windowEnd: p.windowEnd,
              generatedAt: new Date(),
            },
          });
          saved.push(row);
        }
        return saved;
      },
      [],
    );
  },

  async dismiss({ userPublicId, publicId }) {
    return safe(
      'dismiss',
      async () => {
        const result = await prisma.patternInsight.updateMany({
          where: { publicId, user: { publicId: userPublicId } },
          data: { dismissedAt: new Date() },
        });
        return result.count > 0;
      },
      false,
    );
  },

  async setFeedback({ userPublicId, publicId, feedback }) {
    return safe(
      'setFeedback',
      async () => {
        const result = await prisma.patternInsight.updateMany({
          where: { publicId, user: { publicId: userPublicId } },
          data: { feedback },
        });
        return result.count > 0;
      },
      false,
    );
  },
};
