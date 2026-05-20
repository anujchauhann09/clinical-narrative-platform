import { createApp } from './app.js';
import { env } from './config/env.js';
import { pdfClient } from './pdf/pdfClient.js';
import { logger } from './utils/logger.js';

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info(
    { host: env.HOST, port: env.PORT, environment: env.NODE_ENV },
    'API server started',
  );
});

server.on('error', (error) => {
  logger.fatal({ err: error }, 'API server failed to start');
  process.exit(1);
});

const shutdown = (signal) => {
  logger.info({ signal }, 'Shutting down API server');
  server.close(async () => {
    await pdfClient.close().catch((error) => {
      logger.warn({ err: error }, 'pdfClient.close failed during shutdown');
    });
    logger.info('API server stopped');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
