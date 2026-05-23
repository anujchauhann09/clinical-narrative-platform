import { randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_BYTES = 32;


export const generateCsrfToken = () => randomBytes(TOKEN_BYTES).toString('hex');

export const csrfTokensMatch = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length === 0 || a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
};
