import { HTTP_STATUS } from '../constants/httpStatus.js';
import { env } from '../config/env.js';
import { ApiError } from '../errors/index.js';
import { logger } from '../utils/logger.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
const REQUEST_TIMEOUT_MS = 30_000;

const buildEndpoint = (model) =>
  `${BASE_URL}/models/${encodeURIComponent(model)}:generateContent?key=${env.GEMINI_API_KEY}`;

const buildRequestBody = ({ systemInstruction, prompt, generationConfig, responseSchema }) => {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 0.9,
      maxOutputTokens: 4096,
      thinkingConfig: { thinkingBudget: 0 },
      ...generationConfig,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  if (responseSchema) {
    body.generationConfig.responseMimeType = 'application/json';
    body.generationConfig.responseSchema = responseSchema;
  }

  return body;
};

const extractText = (responsePayload) => {
  const candidate = responsePayload?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  const text = parts
    .map((part) => part?.text)
    .filter(Boolean)
    .join('')
    .trim();

  const finishReason = candidate?.finishReason ?? 'UNKNOWN';

  if (!text) {
    throw new ApiError(
      `Gemini returned no text content (finish reason: ${finishReason})`,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  if (finishReason === 'MAX_TOKENS') {
    logger.warn(
      { finishReason, usage: responsePayload?.usageMetadata, textLength: text.length },
      'Gemini response hit MAX_TOKENS — output may be truncated',
    );
    throw new ApiError(
      'AI response was truncated due to token budget. Please retry — token limit has been raised.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
    );
  }

  return text;
};

export const geminiClient = {
  async generate({ systemInstruction, prompt, generationConfig, responseSchema, model } = {}) {
    if (!prompt || typeof prompt !== 'string') {
      throw new ApiError('Gemini prompt must be a non-empty string', HTTP_STATUS.BAD_REQUEST);
    }

    const endpoint = buildEndpoint(model ?? DEFAULT_MODEL);
    const body = buildRequestBody({ systemInstruction, prompt, generationConfig, responseSchema });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Gemini request timed out', HTTP_STATUS.INTERNAL_SERVER_ERROR);
      }
      throw new ApiError(`Gemini request failed: ${error.message}`, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    } finally {
      clearTimeout(timeout);
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message = payload?.error?.message ?? `Gemini API error (HTTP ${response.status})`;
      logger.error({ status: response.status, payload }, 'Gemini API error');
      throw new ApiError(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return extractText(payload);
  },

  async generateJson(options) {
    const raw = await geminiClient.generate(options);
    try {
      return JSON.parse(raw);
    } catch (error) {
      logger.error({ raw, err: error }, 'Failed to parse Gemini JSON response');
      throw new ApiError('Gemini returned malformed JSON', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },
};
