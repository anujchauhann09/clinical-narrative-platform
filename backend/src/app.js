import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import { csrfProtection } from './middlewares/csrf.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';
import { notFoundHandler } from './middlewares/notFound.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimiter.middleware.js';
import { sanitizeRequest } from './middlewares/sanitize.middleware.js';
import routes from './routes/index.js';
import { logger } from './utils/logger.js';

const requestLoggerOptions = {
  logger,
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
};

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(pinoHttp(requestLoggerOptions));
  app.use(helmet());
  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));
  app.use(apiRateLimiter);
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(sanitizeRequest);
  app.use(compression());

  // CSRF must run after cookieParser (needs req.cookies) and only for the
  // API namespace. Safe methods + login/signup/refresh/logout are exempt
  // inside the middleware itself.
  app.use(env.API_PREFIX, csrfProtection, routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
