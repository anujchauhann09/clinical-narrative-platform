import { auditLogRepository } from '../repositories/auditLog.repository.js';
import { logger } from '../utils/logger.js';


export const AUDIT_ACTIONS = Object.freeze({
  AUTH_SIGNUP: 'auth.signup',
  AUTH_LOGIN_SUCCESS: 'auth.login.success',
  AUTH_LOGIN_FAILURE: 'auth.login.failure',
  AUTH_LOGIN_LOCKED: 'auth.login.locked',
  AUTH_LOGOUT: 'auth.logout',
  COPILOT_DOCUMENT_UPLOAD: 'copilot.document.upload',
  COPILOT_DOCUMENT_DELETE: 'copilot.document.delete',
});

const extractIp = (req) => {
  if (!req) return null;
  // Express sets req.ip when `trust proxy` is configured. Falls back to socket address.
  return req.ip ?? req.socket?.remoteAddress ?? null;
};

const extractUserAgent = (req) => {
  if (!req?.headers) return null;
  return req.headers['user-agent'] ?? null;
};

export const auditService = {
  emit({ userPublicId, action, resourceType, resourceId, req, metadata }) {
    const payload = {
      userPublicId: userPublicId ?? null,
      action,
      resourceType,
      resourceId,
      ip: extractIp(req),
      userAgent: extractUserAgent(req),
      metadata,
    };

    auditLogRepository.create(payload).catch((error) => {
      logger.warn(
        { err: error, action, resourceType, resourceId },
        'Audit log write failed',
      );
    });
  },
};
