import { apiClient } from './apiClient.js';

export const insightApi = {
  getInsights() {
    return apiClient.get('/insights');
  },
};
