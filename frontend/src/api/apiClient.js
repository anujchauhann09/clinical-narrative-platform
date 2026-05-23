import axios from 'axios';

import { API_TIMEOUT_MS } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';
import { toFriendlyMessage } from './errorMessages.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

let csrfTokenInMemory = null;

const captureCsrfFromResponseBody = (body) => {
  const token = body?.data?.csrfToken;
  if (typeof token === 'string' && token.length > 0) {
    csrfTokenInMemory = token;
  }
};

export const clearCsrfToken = () => {
  csrfTokenInMemory = null;
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
  if (UNSAFE_METHODS.has(method) && csrfTokenInMemory) {
    config.headers = config.headers ?? {};
    config.headers['X-CSRF-Token'] = csrfTokenInMemory;
  }
  return config;
});

// Single in-flight refresh. Concurrent 401s share the same network call.
let refreshPromise = null;

const performRefresh = () => {
  refreshPromise ??= axios
    .post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
    .then((response) => {
      captureCsrfFromResponseBody(response.data);
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
  (response) => {
    captureCsrfFromResponseBody(response.data);
    return response.data;
  },
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
        clearCsrfToken();
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
