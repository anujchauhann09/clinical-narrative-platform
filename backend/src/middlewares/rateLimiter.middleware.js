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
