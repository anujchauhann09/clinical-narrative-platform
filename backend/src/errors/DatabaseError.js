import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from './ApiError.js';

export class DatabaseError extends ApiError {
  constructor(
    message = "We couldn't complete that action. Please try again.",
    details = null,
  ) {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR, details);
  }
}
