import multer from 'multer';

import { env } from '../config/env.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { SUPPORTED_MIME_TYPES } from '../services/documentExtraction.service.js';

const ALLOWED_MIME_TYPES = new Set(Object.values(SUPPORTED_MIME_TYPES));

const fileFilter = (_req, file, callback) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype) || file.mimetype.startsWith('text/')) {
    callback(null, true);
    return;
  }
  callback(
    new ApiError(
      `Unsupported file type "${file.mimetype}". Allowed: PDF, DOCX, TXT.`,
      HTTP_STATUS.BAD_REQUEST,
    ),
    false,
  );
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.COPILOT_MAX_UPLOAD_BYTES, files: 1 },
  fileFilter,
});

export const copilotUploadSingle = (fieldName = 'file') => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (!error) return next();

    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(
        new ApiError(
          `File exceeds the ${(env.COPILOT_MAX_UPLOAD_BYTES / (1024 * 1024)).toFixed(1)}MB limit`,
          HTTP_STATUS.PAYLOAD_TOO_LARGE,
        ),
      );
    }
    if (error instanceof ApiError) return next(error);
    return next(new ApiError(error.message || 'File upload failed', HTTP_STATUS.BAD_REQUEST));
  });
};
