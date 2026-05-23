import { Router } from 'express';

import {
  chat,
  deleteDocument,
  listDocuments,
  uploadDocument,
} from '../controllers/copilot.controller.js';
import { authenticate } from '../middlewares/authenticate.middleware.js';
import { copilotUploadSingle } from '../middlewares/copilotUpload.middleware.js';
import { aiGenerationRateLimiter } from '../middlewares/rateLimiter.middleware.js';
import { validateRequest } from '../middlewares/validateRequest.middleware.js';
import { chatRequestSchema, documentParamsSchema } from '../validators/copilot.validator.js';

const router = Router();

router.use(authenticate);

router.get('/copilot/documents', listDocuments);

router.post(
  '/copilot/documents',
  copilotUploadSingle('file'),
  uploadDocument,
);

router.delete(
  '/copilot/documents/:documentPublicId',
  validateRequest(documentParamsSchema),
  deleteDocument,
);

router.post(
  '/copilot/chat',
  aiGenerationRateLimiter,
  validateRequest(chatRequestSchema),
  chat,
);

export default router;
