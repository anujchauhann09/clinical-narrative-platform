import { apiClient } from './apiClient.js';

export const symptomApi = {
  getTimeline(params = {}) {
    return apiClient.get('/symptom-entries', { params });
  },

  createEntry(payload) {
    return apiClient.post('/symptom-entries', payload);
  },

  getSymptoms() {
    return apiClient.get('/symptoms');
  },

  getTriggers() {
    return apiClient.get('/triggers');
  },
};
