import { embeddingClient } from '../ai/embeddingClient.js';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import {
  copilotDocumentRepository,
  DOCUMENT_STATUS,
} from '../repositories/copilotDocument.repository.js';
import { chunkArray } from '../utils/arrayChunk.js';
import { logger } from '../utils/logger.js';
import {
  classifyMedicalContent,
  MEDICAL_CONTENT_MESSAGE,
} from '../utils/medicalContentClassifier.js';
import { sanitizeFilename, verifyDocumentFileType } from '../utils/uploadGuards.js';
import { documentExtractionService } from './documentExtraction.service.js';
import { textChunkerService } from './textChunker.service.js';
import { vectorStoreService } from './vectorStore.service.js';

const embedAllChunks = async (chunks) => {
  const batches = chunkArray(chunks, env.COPILOT_EMBEDDING_BATCH);
  const all = [];
  for (const batch of batches) {
    const vectors = await embeddingClient.embedDocuments(batch);
    all.push(...vectors);
  }
  return all;
};

const ingestAsync = async ({ document, userPublicId, buffer }) => {
  try {
    const text = await documentExtractionService.extractText({
      buffer,
      mimeType: document.mimeType,
      filename: document.filename,
    });

    const verdict = classifyMedicalContent(text);
    if (!verdict.isMedical) {
      logger.info(
        {
          documentPublicId: document.publicId,
          score: verdict.score,
          density: verdict.density,
          redFlags: verdict.redFlags,
          reason: verdict.reason,
        },
        'Copilot ingestion rejected non-medical document',
      );
      throw new ApiError(MEDICAL_CONTENT_MESSAGE, HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }

    const chunks = textChunkerService.chunk(text);
    if (!chunks.length) {
      throw new ApiError('No usable text after chunking', HTTP_STATUS.UNPROCESSABLE_ENTITY);
    }

    const vectors = await embedAllChunks(chunks);
    await vectorStoreService.upsertChunks({
      userPublicId,
      documentPublicId: document.publicId,
      vectors: vectors.map((values, index) => ({
        values,
        chunkIndex: index,
        text: chunks[index],
        filename: document.filename,
      })),
    });

    await copilotDocumentRepository.markReady({
      id: document.id,
      chunkCount: chunks.length,
    });

    logger.info(
      { documentPublicId: document.publicId, chunkCount: chunks.length },
      'Copilot document ingested',
    );
  } catch (error) {
    logger.error(
      { err: error, documentPublicId: document.publicId },
      'Copilot ingestion failed',
    );
    await copilotDocumentRepository
      .markFailed({ id: document.id, errorMessage: error?.message })
      .catch(() => {});
  }
};

export const copilotIngestionService = {
  async ingest({ userPublicId, file }) {
    if (!file) throw new ApiError('No file uploaded', HTTP_STATUS.BAD_REQUEST);
    if (!documentExtractionService.isSupportedMimeType(file.mimetype)) {
      throw new ApiError(
        `Unsupported file type "${file.mimetype}". Supported: PDF, DOCX, TXT.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    if (file.size > env.COPILOT_MAX_UPLOAD_BYTES) {
      throw new ApiError(
        `File exceeds the ${(env.COPILOT_MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(1)}MB limit`,
        HTTP_STATUS.PAYLOAD_TOO_LARGE,
      );
    }

    const safeFilename = sanitizeFilename(file.originalname);
    const verifiedMime = verifyDocumentFileType({
      buffer: file.buffer,
      declaredMime: file.mimetype,
      filename: safeFilename,
    });

    if (!vectorStoreService.isConfigured()) {
      throw new ApiError(
        'AI Copilot is not available right now. Vector storage is not configured.',
        HTTP_STATUS.SERVICE_UNAVAILABLE,
      );
    }

    const document = await copilotDocumentRepository.createForUser({
      userPublicId,
      filename: safeFilename,
      mimeType: verifiedMime,
      byteSize: file.size,
    });
    if (!document) {
      throw new ApiError('User not found', HTTP_STATUS.NOT_FOUND);
    }

    ingestAsync({ document, userPublicId, buffer: file.buffer });

    return { ...document, status: DOCUMENT_STATUS.PROCESSING };
  },

  async deleteDocument({ userPublicId, documentPublicId }) {
    const owned = await copilotDocumentRepository.findOwned({
      userPublicId,
      documentPublicId,
    });
    if (!owned) {
      throw new ApiError('Document not found', HTTP_STATUS.NOT_FOUND);
    }
    await vectorStoreService.deleteDocument({ userPublicId, documentPublicId });
    await copilotDocumentRepository.deleteOwned({ userPublicId, documentPublicId });
  },

  async listDocuments(userPublicId) {
    return copilotDocumentRepository.listForUser(userPublicId);
  },
};
