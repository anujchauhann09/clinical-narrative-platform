import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';

export const notFoundHandler = (req, _res, next) => {
  next(new ApiError(`Route not found: ${req.method} ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND));
};
