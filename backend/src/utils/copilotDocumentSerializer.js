export const serializeCopilotDocument = (document) => {
  if (!document) return null;
  return {
    publicId: document.publicId,
    filename: document.filename,
    byteSize: Number(document.byteSize ?? 0),
    status: document.status,
    errorMessage: document.errorMessage ?? null,
  };
};
