import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from './ApiError.js';

export class AuthError extends ApiError {
  constructor(message = 'Authentication failed', details = null) {
    super(message, HTTP_STATUS.UNAUTHORIZED, details);
  }
}
