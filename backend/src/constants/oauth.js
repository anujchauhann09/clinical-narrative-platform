// Supported OAuth providers. Values are the lowercase tokens used in the route
// path (e.g. GET /oauth/google) and the `:provider` param.
export const OAUTH_PROVIDERS = Object.freeze({
  GOOGLE: 'google',
});

// Stored on OAuthAccount.provider — kept uppercase so the column is stable
// regardless of how the provider is spelled in a URL.
export const OAUTH_PROVIDER_KEYS = Object.freeze({
  GOOGLE: 'GOOGLE',
});

// Google's well-known OAuth 2.0 endpoints. These are fixed, so they live in
// code rather than env (only the client credentials / callback are secret).
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
});
