// Brand identity. Anything user-visible should pull from here, never hardcode
// the product name — that's how branding drifts when copy gets edited.
export const APP_NAME = 'SymptIQ';
export const APP_TAGLINE = 'Clinical Narrative Platform for AI-Powered Symptom Intelligence';
// Compact form for nav chips / kickers where the full tagline doesn't fit.
export const APP_KICKER = 'Symptom Intelligence';

export const API_TIMEOUT_MS = 15_000;

export const ROUTES = Object.freeze({
  HOME: '/',
  ABOUT: '/about',
  PRIVACY: '/privacy',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  SIGNUP: '/signup',
  TIMELINE: '/timeline',
  INSIGHTS: '/insights',
  NARRATIVES: '/narratives',
  REPORTS: '/reports',
  PROFILE: '/profile',
  SETTINGS: '/settings',
});
