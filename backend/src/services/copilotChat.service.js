import { embeddingClient } from '../ai/embeddingClient.js';
import { geminiClient } from '../ai/geminiClient.js';
import { buildCopilotPrompt } from '../ai/promptTemplates/copilotChat.js';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { copilotContextService } from './copilotContext.service.js';
import { vectorStoreService } from './vectorStore.service.js';

const MAX_USER_MESSAGE_CHARS = 4_000;
const MAX_HISTORY_TURNS = 6;

const sanitizeHistory = (history) =>
  (Array.isArray(history) ? history : [])
    .filter((turn) => turn && (turn.role === 'user' || turn.role === 'assistant'))
    .map((turn) => ({
      role: turn.role,
      content: String(turn.content ?? '').slice(0, 4000),
    }))
    .slice(-MAX_HISTORY_TURNS);

const retrieveDocumentChunks = async ({ userPublicId, message, documentPublicId }) => {
  if (!vectorStoreService.isConfigured()) return [];
  try {
    const queryVector = await embeddingClient.embedQuery(message);
    return await vectorStoreService.query({
      userPublicId,
      vector: queryVector,
      topK: env.COPILOT_TOP_K,
      documentPublicId,
    });
  } catch (error) {
    // Retrieval failures should not break chat. Fall back to platform-only context.
    return [];
  }
};

export const copilotChatService = {
  async respond({ userPublicId, message, history, documentPublicId }) {
    const trimmed = String(message ?? '').trim();
    if (!trimmed) {
      throw new ApiError('Message cannot be empty', HTTP_STATUS.BAD_REQUEST);
    }
    if (trimmed.length > MAX_USER_MESSAGE_CHARS) {
      throw new ApiError(
        `Message is too long (max ${MAX_USER_MESSAGE_CHARS} characters)`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const [platformContext, retrievedChunks] = await Promise.all([
      copilotContextService.buildUserContext(userPublicId),
      retrieveDocumentChunks({ userPublicId, message: trimmed, documentPublicId }),
    ]);

    const promptPayload = buildCopilotPrompt({
      userMessage: trimmed,
      history: sanitizeHistory(history),
      platformContext: platformContext.text,
      retrievedChunks,
    });

    const answer = await geminiClient.generate({
      ...promptPayload,
      apiKey: env.GEMINI_COPILOT_API_KEY ?? undefined,
      generationConfig: {
        temperature: 0.3,
        topP: 0.9,
        maxOutputTokens: 1024,
      },
    });

    return {
      message: answer.trim(),
      sources: retrievedChunks.map((chunk) => ({
        documentPublicId: chunk.documentPublicId,
        filename: chunk.filename,
        chunkIndex: chunk.chunkIndex,
        score: chunk.score,
      })),
      retrievedCount: retrievedChunks.length,
      hasPlatformData: platformContext.hasData,
    };
  },
};
