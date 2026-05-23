import { HTTP_STATUS } from '../constants/httpStatus.js';
import { env } from '../config/env.js';
import { ApiError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const REQUEST_TIMEOUT_MS = 30_000;

// Copilot has its own optional API key so RAG traffic can be isolated from
// the rest of the platform's Gemini usage (quotas, billing, key rotation).
const apiKey = () => env.GEMINI_COPILOT_API_KEY ?? env.GEMINI_API_KEY;

const buildEndpoint = (path) =>
  `${BASE_URL}/models/${encodeURIComponent(env.GEMINI_EMBEDDING_MODEL)}:${path}?key=${apiKey()}`;

const callGemini = async (path, body) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(buildEndpoint(path), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new ApiError('Embedding request timed out', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    throw new ApiError(`Embedding request failed: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  } finally {
    clearTimeout(timeout);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message ?? `Embedding API error (HTTP ${response.status})`;
    logger.error({ status: response.status, payload }, 'Gemini embedding error');
    throw new ApiError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return payload;
};

const buildContent = (text) => ({ parts: [{ text }] });

export const TASK_TYPES = Object.freeze({
  RETRIEVAL_DOCUMENT: 'RETRIEVAL_DOCUMENT',
  RETRIEVAL_QUERY: 'RETRIEVAL_QUERY',
});

export const embeddingClient = {
  async embedQuery(text) {
    if (!text || typeof text !== 'string') {
      throw new ApiError('Embedding text must be a non-empty string', HTTP_STATUS.BAD_REQUEST);
    }

    const payload = await callGemini('embedContent', {
      content: buildContent(text),
      taskType: TASK_TYPES.RETRIEVAL_QUERY,
      outputDimensionality: env.GEMINI_EMBEDDING_DIMENSIONS,
    });

    const values = payload?.embedding?.values;
    if (!Array.isArray(values) || values.length === 0) {
      throw new ApiError('Embedding response was empty', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    return values;
  },

  async embedDocuments(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
      throw new ApiError('embedDocuments requires a non-empty array', HTTP_STATUS.BAD_REQUEST);
    }

    const model = `models/${env.GEMINI_EMBEDDING_MODEL}`;
    const payload = await callGemini('batchEmbedContents', {
      requests: texts.map((text) => ({
        model,
        content: buildContent(text),
        taskType: TASK_TYPES.RETRIEVAL_DOCUMENT,
        outputDimensionality: env.GEMINI_EMBEDDING_DIMENSIONS,
      })),
    });

    const embeddings = payload?.embeddings;
    if (!Array.isArray(embeddings) || embeddings.length !== texts.length) {
      throw new ApiError('Embedding response shape was unexpected', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
    return embeddings.map((entry) => entry.values);
  },
};
