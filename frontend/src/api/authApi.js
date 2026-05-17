import { apiClient } from './apiClient.js';

export const authApi = {
  signup(payload) {
    return apiClient.post('/auth/signup', payload);
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

  getMe() {
    return apiClient.get('/auth/me');
  },
};
