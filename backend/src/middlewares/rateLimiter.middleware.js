import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiResponse } from '../utils/apiResponse.js';

const tooManyRequestsHandler = (message) => (_req, res) => {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(ApiResponse.error({ message }));
};

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: tooManyRequestsHandler('Too many requests. Please try again later.'),
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: tooManyRequestsHandler(
    'Too many authentication attempts. Please wait a few minutes and try again.',
  ),
});

export const aiGenerationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.auth?.sub ?? ipKeyGenerator(req.ip),
  handler: tooManyRequestsHandler(
    'AI generation rate limit reached. Please wait before generating another summary.',
  ),
});

export const pdfExportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.auth?.sub ?? ipKeyGenerator(req.ip),
  handler: tooManyRequestsHandler(
    'PDF export rate limit reached. Please wait before downloading another report.',
  ),
});
