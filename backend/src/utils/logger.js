import path from 'node:path';
import { fileURLToPath } from 'node:url';

import pino from 'pino';

import { env } from '../config/env.js';
import { loggerConfig } from '../config/logger.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.resolve(here, '../../logs');

const targets = [];

if (env.NODE_ENV === 'production') {
  // Production: raw JSON to stdout so log aggregators (Loki, Datadog, etc.)
  // get the structured stream they expect.
  targets.push({
    target: 'pino/file',
    level: env.LOG_LEVEL,
    options: { destination: 1 },
  });
} else {
  // Dev / test: human-readable, colored terminal output.
  targets.push({
    target: 'pino-pretty',
    level: env.LOG_LEVEL,
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss.l',
      ignore: 'pid,hostname',
      singleLine: false,
    },
  });
}

// Always: persist errors-and-above to a rolling file so we can investigate
// 500s after a server restart. Daily rotation, 10MB cap per file, 14 files
// retained (~two weeks). Disk footprint stays bounded.
targets.push({
  target: 'pino-roll',
  level: 'error',
  options: {
    file: path.join(logsDir, 'error.log'),
    frequency: 'daily',
    size: '10m',
    limit: { count: 14 },
    mkdir: true,
    dateFormat: 'yyyy-MM-dd',
  },
});

const transport = pino.transport({ targets });

export const logger = pino(loggerConfig, transport);
