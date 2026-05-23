export const serializeCopilotDocument = (document) => {
  if (!document) return null;
  return {
    publicId: document.publicId,
    filename: document.filename,
    mimeType: document.mimeType,
    byteSize: Number(document.byteSize ?? 0),
    chunkCount: Number(document.chunkCount ?? 0),
    status: document.status,
    errorMessage: document.errorMessage ?? null,
    createdAt: document.createdAt instanceof Date
      ? document.createdAt.toISOString()
      : document.createdAt,
  };
};
