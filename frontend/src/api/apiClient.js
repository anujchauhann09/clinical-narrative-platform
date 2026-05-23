import axios from 'axios';

import { API_TIMEOUT_MS } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

// CSRF: the backend sets a non-HttpOnly `csrfToken` cookie on login/refresh.
// We mirror it into the X-CSRF-Token header on every unsafe request
// (double-submit cookie pattern). On safe methods the backend skips the check.
const UNSAFE_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const readCsrfCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((part) => part.startsWith('csrfToken='));
  return match ? decodeURIComponent(match.slice('csrfToken='.length)) : null;
};

// Auth endpoints that should NOT trigger an automatic refresh on 401.
//   - login / signup: 401 means bad credentials, not an expired session.
//   - refresh: would recurse and mask the real reason the refresh failed.
//   - logout: 401 is irrelevant; we're tearing the session down anyway.
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
        // Refresh failed too: the session is unrecoverable. Wipe local state so
        // ProtectedRoute redirects to login. The cookies are already cleared
        // server-side by /auth/refresh on its 401 path.
        useAuthStore.getState().clearSession();
      }
    }

    const responseData = error.response?.data;
    const isBlobBody = typeof Blob !== 'undefined' && responseData instanceof Blob;
    const message = isBlobBody
      ? error.message ?? 'Something went wrong. Please try again.'
      : responseData?.message ?? error.message ?? 'Something went wrong. Please try again.';

    return Promise.reject({
      message,
      status,
      details: isBlobBody ? responseData : responseData?.details ?? null,
    });
  },
);
