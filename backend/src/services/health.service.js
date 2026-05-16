export const healthService = {
  getApiHealth() {
    return {
      service: 'clinical-narrative-platform-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  },
};
