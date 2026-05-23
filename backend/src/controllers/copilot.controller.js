import { HTTP_STATUS } from '../constants/httpStatus.js';
import { copilotChatService } from '../services/copilotChat.service.js';
import { copilotIngestionService } from '../services/copilotIngestion.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { serializeCopilotDocument } from '../utils/copilotDocumentSerializer.js';

export const uploadDocument = asyncHandler(async (req, res) => {
  const document = await copilotIngestionService.ingest({
    userPublicId: req.auth.sub,
    file: req.file,
  });

  res.status(HTTP_STATUS.ACCEPTED).json(
    ApiResponse.success({
      message: 'Document accepted for indexing',
      data: { document: serializeCopilotDocument(document) },
    }),
  );
});

export const listDocuments = asyncHandler(async (req, res) => {
  const documents = await copilotIngestionService.listDocuments(req.auth.sub);
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Copilot documents fetched',
      data: { documents: documents.map(serializeCopilotDocument) },
    }),
  );
});

export const deleteDocument = asyncHandler(async (req, res) => {
  await copilotIngestionService.deleteDocument({
    userPublicId: req.auth.sub,
    documentPublicId: req.validated.params.documentPublicId,
  });
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({ message: 'Document removed' }),
  );
});

export const chat = asyncHandler(async (req, res) => {
  const result = await copilotChatService.respond({
    userPublicId: req.auth.sub,
    message: req.validated.body.message,
    history: req.validated.body.history,
    documentPublicId: req.validated.body.documentPublicId,
  });
  res.status(HTTP_STATUS.OK).json(
    ApiResponse.success({
      message: 'Copilot response generated',
      data: result,
    }),
  );
});
