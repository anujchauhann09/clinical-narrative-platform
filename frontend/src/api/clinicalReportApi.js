import { apiClient } from './apiClient.js';

const DOWNLOAD_TIMEOUT_MS = 60_000;

const readBlobAsJson = async (blob) => {
  if (!blob || typeof blob.text !== 'function') return null;
  try {
    const text = await blob.text();
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export const clinicalReportApi = {
  async downloadClinicalReport(window = {}) {
    const params = {};
    if (window.from) params.from = window.from;
    if (window.to) params.to = window.to;

    try {
      const response = await apiClient.get('/reports/clinical', {
        params,
        responseType: 'blob',
        timeout: DOWNLOAD_TIMEOUT_MS,
      });

      if (!(response instanceof Blob)) {
        throw { message: 'Unexpected response while downloading report' };
      }

      if (response.type && response.type.startsWith('application/json')) {
        const errorPayload = await readBlobAsJson(response);
        throw {
          message: errorPayload?.message ?? 'Failed to download report',
          details: errorPayload?.details ?? null,
        };
      }

      return response;
    } catch (error) {
      if (error?.details instanceof Blob) {
        const payload = await readBlobAsJson(error.details);
        throw {
          message: payload?.message ?? error.message ?? 'Failed to download report',
          status: error.status,
          details: payload?.details ?? null,
        };
      }
      throw error;
    }
  },
};
