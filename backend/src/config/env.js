import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  HOST: z.string().min(1).default('127.0.0.1'),
  API_PREFIX: z.string().min(1).default('/api/v1'),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().min(1).default('http://localhost:5173,http://127.0.0.1:5173'),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_API_MODEL: z.string().min(1).default('gemini-2.5-flash'),
  GEMINI_COPILOT_API_KEY: z.string().min(1).optional(),
  GEMINI_EMBEDDING_MODEL: z.string().min(1).default('gemini-embedding-001'),
  GEMINI_EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(768),
  PINECONE_API_KEY: z.string().min(1).optional(),
  PINECONE_INDEX: z.string().min(1).optional(),
  COPILOT_MAX_UPLOAD_BYTES: z.coerce.number().int().positive().default(10 * 1024 * 1024),
  COPILOT_CHUNK_SIZE: z.coerce.number().int().positive().default(1200),
  COPILOT_CHUNK_OVERLAP: z.coerce.number().int().nonnegative().default(180),
  COPILOT_TOP_K: z.coerce.number().int().positive().default(6),
  COPILOT_EMBEDDING_BATCH: z.coerce.number().int().positive().default(16),
  // Optional override. When unset, puppeteer uses its bundled Chromium.
  CHROME_EXECUTABLE_PATH: z.string().min(1).optional(),
  UPLOAD_DIR: z.string().min(1).default('uploads'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const formattedErrors = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join(', ');

  throw new Error(`Invalid environment configuration: ${formattedErrors}`);
}

export const env = parsedEnv.data;
