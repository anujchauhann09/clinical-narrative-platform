import { apiClient } from './apiClient.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

const resolveApiOrigin = () => {
  try {
    return new URL(API_BASE_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

export const oauthStartUrl = (provider) => `${resolveApiOrigin()}/oauth/${provider}`;

export const authApi = {
  signup(payload) {
    return apiClient.post('/auth/signup', payload);
  },

  login(payload) {
    return apiClient.post('/auth/login', payload);
  },

  logout() {
    return apiClient.post('/auth/logout');
  },

  oauthExchange(code) {
    return apiClient.post('/auth/oauth/exchange', { code });
  },

  getMe() {
    return apiClient.get('/auth/me');
  },
};
