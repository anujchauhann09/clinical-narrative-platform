import { apiClient } from './apiClient.js';

export const insightApi = {
  getSummaries(params = {}) {
    return apiClient.get('/ai-summaries', { params });
  },

  generateSummary(payload) {
    return apiClient.post('/ai-summaries', payload);
  },
};
