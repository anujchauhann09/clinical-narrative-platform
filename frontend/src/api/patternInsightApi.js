import { apiClient } from './apiClient.js';

export const patternInsightApi = {
  list() {
    return apiClient.get('/pattern-insights');
  },

  dismiss(publicId) {
    return apiClient.post(`/pattern-insights/${publicId}/dismiss`);
  },

  submitFeedback(publicId, feedback) {
    return apiClient.post(`/pattern-insights/${publicId}/feedback`, { feedback });
  },
};
