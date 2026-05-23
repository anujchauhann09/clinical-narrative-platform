import { prisma } from '../database/prisma.js';

export const DOCUMENT_STATUS = Object.freeze({
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
});

const userIdFromPublicId = async (userPublicId) => {
  const user = await prisma.user.findUnique({
    where: { publicId: userPublicId },
    select: { id: true },
  });
  return user?.id ?? null;
};

export const copilotDocumentRepository = {
  async createForUser({ userPublicId, filename, mimeType, byteSize }) {
    const userId = await userIdFromPublicId(userPublicId);
    if (!userId) return null;
    return prisma.copilotDocument.create({
      data: {
        userId,
        filename,
        mimeType,
        byteSize,
        status: DOCUMENT_STATUS.PROCESSING,
      },
    });
  },

  async markReady({ id, chunkCount }) {
    return prisma.copilotDocument.update({
      where: { id },
      data: { status: DOCUMENT_STATUS.READY, chunkCount, errorMessage: null },
    });
  },

  async markFailed({ id, errorMessage }) {
    return prisma.copilotDocument.update({
      where: { id },
      data: {
        status: DOCUMENT_STATUS.FAILED,
        errorMessage: errorMessage?.slice(0, 500) ?? null,
      },
    });
  },

  async listForUser(userPublicId) {
    return prisma.copilotDocument.findMany({
      where: { user: { publicId: userPublicId } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findOwned({ userPublicId, documentPublicId }) {
    return prisma.copilotDocument.findFirst({
      where: {
        publicId: documentPublicId,
        user: { publicId: userPublicId },
      },
    });
  },

  async deleteOwned({ userPublicId, documentPublicId }) {
    const result = await prisma.copilotDocument.deleteMany({
      where: {
        publicId: documentPublicId,
        user: { publicId: userPublicId },
      },
    });
    return result.count > 0;
  },
};
