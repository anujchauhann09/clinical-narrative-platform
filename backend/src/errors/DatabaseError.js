import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from './ApiError.js';

export class DatabaseError extends ApiError {
  constructor(message = 'Database operation failed', details = null) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, details);
  }
}
