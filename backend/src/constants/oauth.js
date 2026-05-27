export const OAUTH_PROVIDERS = Object.freeze({
  GOOGLE: 'google',
});

export const OAUTH_PROVIDER_KEYS = Object.freeze({
  GOOGLE: 'GOOGLE',
});

export const GOOGLE_ENDPOINTS = Object.freeze({
  AUTH: 'https://accounts.google.com/o/oauth2/v2/auth',
  TOKEN: 'https://oauth2.googleapis.com/token',
  USERINFO: 'https://www.googleapis.com/oauth2/v2/userinfo',
});

export const GOOGLE_SCOPES = 'openid email profile';

export const OAUTH_MESSAGES = Object.freeze({
  INVALID_PROVIDER: 'Unsupported authentication provider',
  NOT_CONFIGURED: 'This sign-in method is not configured',
  STATE_MISMATCH: 'Authentication request could not be verified. Please try again.',
  MISSING_CODE: 'Authentication was cancelled or failed. Please try again.',
  PROVIDER_FAILED: 'Could not complete sign-in with the provider. Please try again.',
  EXCHANGE_FAILED: 'Sign-in link has expired. Please try again.',
});
