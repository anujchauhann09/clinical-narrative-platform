import axios from 'axios';

import { API_TIMEOUT_MS } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';
import { toFriendlyMessage } from './errorMessages.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const readCsrfCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith('csrfToken='));
  return match ? decodeURIComponent(match.slice('csrfToken='.length)) : null;
};

const REFRESH_SKIP_PREFIXES = ['/auth/login', '/auth/signup', '/auth/refresh', '/auth/logout'];

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toLowerCase();
  if (UNSAFE_METHODS.has(method)) {
    const token = readCsrfCookie();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers['X-CSRF-Token'] = token;
    }
  }
  return config;
});

// Single in-flight refresh. Concurrent 401s share the same network call.
let refreshPromise = null;

const performRefresh = () => {
  refreshPromise ??= axios
    .post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
    .then((response) => {
      const user = response.data?.data?.user;
      if (user) useAuthStore.getState().setSession({ user });
      return response.data;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? '';
    const status = error.response?.status;
    const skipRefresh = REFRESH_SKIP_PREFIXES.some((prefix) => url.startsWith(prefix));

    if (status === 401 && originalRequest && !originalRequest._retry && !skipRefresh) {
      originalRequest._retry = true;

      try {
        await performRefresh();
        return apiClient(originalRequest);
      } catch (_refreshError) {
        useAuthStore.getState().clearSession();
      }
    }

    const responseData = error.response?.data;
    const isBlobBody = typeof Blob !== 'undefined' && responseData instanceof Blob;
    const serverMessage = isBlobBody ? undefined : responseData?.message;

    const message = toFriendlyMessage({
      status,
      serverMessage,
      axiosError: error,
    });

    return Promise.reject({
      message,
      status,
      details: isBlobBody ? responseData : responseData?.details ?? null,
    });
  },
);
