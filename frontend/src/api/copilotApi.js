import { apiClient } from './apiClient.js';

export const copilotApi = {
  listDocuments() {
    return apiClient.get('/copilot/documents');
  },

  uploadDocument(file, { signal } = {}) {
    const form = new FormData();
    form.append('file', file);
    // Let the browser set the multipart boundary itself by overriding the
    // default JSON Content-Type with `undefined`. Axios will then derive the
    // correct `multipart/form-data; boundary=...` header from the FormData.
    return apiClient.post('/copilot/documents', form, {
      headers: { 'Content-Type': undefined },
      signal,
    });
  },

  deleteDocument(documentPublicId) {
    return apiClient.delete(`/copilot/documents/${documentPublicId}`);
  },

  chat({ message, history, documentPublicId, signal } = {}) {
    return apiClient.post(
      '/copilot/chat',
      { message, history, documentPublicId },
      { signal },
    );
  },
};
