import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '../layouts/AppLayout.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { PublicOnlyRoute } from './PublicOnlyRoute.jsx';
import { RouteErrorElement } from './RouteErrorElement.jsx';
import { ROUTES } from '../constants/app.js';

const errorElement = <RouteErrorElement />;

// Pages are loaded on demand via react-router's `lazy` so a first-time visitor
// to /dashboard doesn't download the code for Timeline, Insights, Narratives,
// Reports, Profile, and Settings up front. Vite turns each `import('…')` into
// its own JS chunk automatically. Layouts stay eager because every page needs
// them and they're tiny.
const lazyRoute = (path, importer, exportName) => ({
  path,
  lazy: async () => {
    const mod = await importer();
    return { Component: mod[exportName] };
  },
});

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement,
    children: [
      lazyRoute(ROUTES.HOME, () => import('../pages/LandingPage.jsx'), 'LandingPage'),
      lazyRoute(ROUTES.ABOUT, () => import('../pages/AboutPage.jsx'), 'AboutPage'),
      lazyRoute(ROUTES.PRIVACY, () => import('../pages/PrivacyPage.jsx'), 'PrivacyPage'),
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        errorElement,
        children: [
          lazyRoute(ROUTES.LOGIN, () => import('../pages/LoginPage.jsx'), 'LoginPage'),
          lazyRoute(ROUTES.SIGNUP, () => import('../pages/SignupPage.jsx'), 'SignupPage'),
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        errorElement,
        children: [
          lazyRoute(ROUTES.DASHBOARD, () => import('../pages/DashboardPage.jsx'), 'DashboardPage'),
          lazyRoute(ROUTES.TIMELINE, () => import('../pages/TimelinePage.jsx'), 'TimelinePage'),
          lazyRoute(ROUTES.INSIGHTS, () => import('../pages/InsightsPage.jsx'), 'InsightsPage'),
          lazyRoute(ROUTES.NARRATIVES, () => import('../pages/NarrativesPage.jsx'), 'NarrativesPage'),
          lazyRoute(ROUTES.REPORTS, () => import('../pages/ReportsPage.jsx'), 'ReportsPage'),
          lazyRoute(ROUTES.PROFILE, () => import('../pages/ProfilePage.jsx'), 'ProfilePage'),
          lazyRoute(ROUTES.SETTINGS, () => import('../pages/SettingsPage.jsx'), 'SettingsPage'),
        ],
      },
    ],
  },
  {
    path: '*',
    lazy: async () => {
      const { NotFoundPage } = await import('../pages/NotFoundPage.jsx');
      return { Component: NotFoundPage };
    },
  },
]);
