import { apiClient } from './apiClient.js';

export const authApi = {
  register(payload) {
    return apiClient.post('/auth/register', payload);
  },

  login(payload) {
    return apiClient.post('/auth/login', payload);
  },

  refreshToken() {
    return apiClient.post('/auth/refresh');
  },

  logout() {
    return apiClient.post('/auth/logout');
  },
};
