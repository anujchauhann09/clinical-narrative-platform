import rateLimit from 'express-rate-limit';

import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json(
      ApiResponse.error({
        message: 'Too many requests. Please try again later.',
      }),
    );
  },
});
