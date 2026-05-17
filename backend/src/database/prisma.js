import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const prismaClientOptions =
  env.NODE_ENV === 'development'
    ? {
        log: [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ],
      }
    : {
        log: [
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ],
      };

const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
  ...prismaClientOptions,
});

prisma.$on('error', (event) => {
  logger.error({ target: event.target, message: event.message }, 'Prisma error');
});

prisma.$on('warn', (event) => {
  logger.warn({ target: event.target, message: event.message }, 'Prisma warning');
});

if (env.NODE_ENV === 'development') {
  prisma.$on('query', (event) => {
    logger.debug({ query: event.query, duration: event.duration }, 'Prisma query');
  });
}
