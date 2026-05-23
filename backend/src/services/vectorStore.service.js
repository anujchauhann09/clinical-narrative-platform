import { getPineconeIndex, isPineconeConfigured } from '../config/pinecone.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { chunkArray } from '../utils/arrayChunk.js';
import { logger } from '../utils/logger.js';

const UPSERT_BATCH = 100;

const ensureConfigured = () => {
  if (!isPineconeConfigured()) {
    throw new ApiError(
      'AI Copilot vector store is not configured. Ask an admin to set PINECONE_API_KEY and PINECONE_INDEX.',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
    );
  }
};

const namespaceFor = (userPublicId) => `user-${userPublicId}`;

export const vectorStoreService = {
  namespaceFor,
  isConfigured: isPineconeConfigured,

  async upsertChunks({ userPublicId, documentPublicId, vectors }) {
    ensureConfigured();
    if (!vectors?.length) return;

    const namespace = getPineconeIndex().namespace(namespaceFor(userPublicId));
    const records = vectors.map((vector) => ({
      id: `${documentPublicId}::${vector.chunkIndex}`,
      values: vector.values,
      metadata: {
        userPublicId,
        documentPublicId,
        chunkIndex: vector.chunkIndex,
        text: vector.text,
        filename: vector.filename,
      },
    }));

    for (const batch of chunkArray(records, UPSERT_BATCH)) {
      await namespace.upsert(batch);
    }

    logger.info(
      { userPublicId, documentPublicId, count: records.length },
      'Copilot vectors upserted',
    );
  },

  async query({ userPublicId, vector, topK, documentPublicId }) {
    ensureConfigured();

    const namespace = getPineconeIndex().namespace(namespaceFor(userPublicId));
    const queryRequest = {
      vector,
      topK,
      includeMetadata: true,
    };
    if (documentPublicId) {
      queryRequest.filter = { documentPublicId: { $eq: documentPublicId } };
    }

    const response = await namespace.query(queryRequest);
    return (response?.matches ?? []).map((match) => ({
      id: match.id,
      score: match.score,
      text: match.metadata?.text ?? '',
      filename: match.metadata?.filename ?? null,
      documentPublicId: match.metadata?.documentPublicId ?? null,
      chunkIndex: match.metadata?.chunkIndex ?? null,
    }));
  },

  async deleteDocument({ userPublicId, documentPublicId }) {
    if (!isPineconeConfigured()) return;
    try {
      const namespace = getPineconeIndex().namespace(namespaceFor(userPublicId));
      await namespace.deleteMany({ documentPublicId: { $eq: documentPublicId } });
    } catch (error) {
      logger.warn(
        { err: error, userPublicId, documentPublicId },
        'Failed to delete copilot vectors',
      );
    }
  },
};
