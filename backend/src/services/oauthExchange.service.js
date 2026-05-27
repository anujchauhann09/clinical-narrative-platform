import crypto from 'node:crypto';

const CODE_TTL_MS = 60 * 1000;

const codes = new Map();

const purgeExpired = (now = Date.now()) => {
  for (const [code, entry] of codes) {
    if (entry.expiresAt <= now) codes.delete(code);
  }
};

export const oauthExchangeStore = {
  issue(session) {
    purgeExpired();
    const code = crypto.randomBytes(32).toString('base64url');
    codes.set(code, { session, expiresAt: Date.now() + CODE_TTL_MS });
    return code;
  },

  consume(code) {
    if (!code) return null;
    const entry = codes.get(code);
    if (!entry) return null;
    codes.delete(code);
    if (entry.expiresAt <= Date.now()) return null;
    return entry.session;
  },
};
