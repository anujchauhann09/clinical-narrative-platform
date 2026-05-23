import { APP_SERVICE_ID } from '../constants/branding.js';

export const healthService = {
  getApiHealth() {
    return {
      service: APP_SERVICE_ID,
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  },
};
