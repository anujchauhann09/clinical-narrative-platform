import { env } from './env.js';


export const loggerConfig = {
  level: env.LOG_LEVEL,
  base: undefined,
  redact: {
    paths: [
      // --- transport / auth secrets ---
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.token',
      '*.accessToken',
      '*.refreshToken',
      '*.tokenHash',
      'req.body.password',
      'req.body.currentPassword',
      'req.body.newPassword',

      // --- PHI / PII potentially in request bodies ---
      'req.body.notes',
      'req.body.message',
      'req.body.content',
      'req.body.history',
      'req.body.dateOfBirth',
      'req.body.phone',
      'req.body.bio',

      // --- AI / RAG payloads ---
      '*.prompt',
      '*.systemInstruction',
      '*.embedding',
      '*.embeddings',
      '*.chunks',
      '*.text',

      // --- profile fields when nested ---
      '*.profile.dateOfBirth',
      '*.profile.phone',
      '*.profile.bio',
    ],
    censor: '[REDACTED]',
    remove: false,
  },
};
