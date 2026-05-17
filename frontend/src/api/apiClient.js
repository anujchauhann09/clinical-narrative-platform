import axios from 'axios';

import { API_TIMEOUT_MS } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let refreshRequest = null;

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      refreshRequest ??= axios
        .post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
        .then((response) => response.data)
        .finally(() => {
          refreshRequest = null;
        });

      const refreshResponse = await refreshRequest;
      const { accessToken, user } = refreshResponse.data;
      useAuthStore.getState().setSession({ accessToken, user });

      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    }

    if (error.response?.status === 401 && originalRequest?.url === '/auth/refresh') {
      useAuthStore.getState().clearSession();
    }

    const message =
      error.response?.data?.message ?? error.message ?? 'Something went wrong. Please try again.';

    return Promise.reject({
      message,
      status: error.response?.status,
      details: error.response?.data?.details ?? null,
    });
  },
);
