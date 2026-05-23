import { prisma } from '../database/prisma.js';

export const auditLogRepository = {
  // Audit writes must never block or fail the caller's main flow. The service
  // wraps this call in a fire-and-forget with its own error swallow.
  create({ userPublicId, action, resourceType, resourceId, ip, userAgent, metadata }) {
    return prisma.auditLog.create({
      data: {
        userPublicId: userPublicId ?? null,
        action,
        resourceType: resourceType ?? null,
        resourceId: resourceId ?? null,
        ip: ip ?? null,
        userAgent: userAgent ? userAgent.slice(0, 500) : null,
        metadata: metadata ?? undefined,
      },
      select: { publicId: true },
    });
  },
};
