import { apiClient } from './apiClient.js';

export const userApi = {
  getMe() {
    return apiClient.get('/users/me');
  },

  updateProfile(payload) {
    return apiClient.patch('/users/me', payload);
  },

  deleteAccount(password) {
    return apiClient.delete('/users/me', { data: { password } });
  },
};
