import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from './ApiError.js';

export class ValidationError extends ApiError {
  constructor(message = 'Validation failed', details = null) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, details);
  }
}
