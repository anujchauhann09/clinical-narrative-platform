import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError, DatabaseError, ValidationError } from '../errors/index.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';

const normalizeError = (error) => {
  if (error instanceof ApiError) return error;

  if (error instanceof ZodError) {
    return new ValidationError(
      'Validation failed',
      error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    );
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    return new DatabaseError('Database operation failed');
  }

  return new ApiError('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

export const errorHandler = (error, req, res, _next) => {
  const normalizedError = normalizeError(error);

  logger.error(
    {
      err: error,
      requestId: req.id,
      statusCode: normalizedError.statusCode,
    },
    normalizedError.message,
  );

  res.status(normalizedError.statusCode).json(
    ApiResponse.error({
      message: normalizedError.message,
      details: normalizedError.details,
    }),
  );
};
