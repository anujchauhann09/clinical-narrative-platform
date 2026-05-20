import { apiClient } from './apiClient.js';

export const symptomApi = {
  listEntries(params = {}) {
    return apiClient.get('/symptom-entries', { params });
  },

  createEntry(payload) {
    return apiClient.post('/symptom-entries', payload);
  },

  updateEntry(publicId, payload) {
    return apiClient.patch(`/symptom-entries/${publicId}`, payload);
  },

  deleteEntry(publicId) {
    return apiClient.delete(`/symptom-entries/${publicId}`);
  },

  getEntry(publicId) {
    return apiClient.get(`/symptom-entries/${publicId}`);
  },

  getSummary() {
    return apiClient.get('/symptom-entries/summary');
  },

  listSymptoms() {
    return apiClient.get('/symptoms');
  },

  listTriggers() {
    return apiClient.get('/triggers');
  },
};
