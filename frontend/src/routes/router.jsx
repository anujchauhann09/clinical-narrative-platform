import { createBrowserRouter } from 'react-router-dom';

import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { InsightsPage } from '../pages/InsightsPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { NarrativesPage } from '../pages/NarrativesPage.jsx';
import { ReportsPage } from '../pages/ReportsPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { ProfilePage } from '../pages/ProfilePage.jsx';
import { SignupPage } from '../pages/SignupPage.jsx';
import { TimelinePage } from '../pages/TimelinePage.jsx';
import { LandingPage } from '../pages/LandingPage.jsx';
import { AboutPage } from '../pages/AboutPage.jsx';
import { PrivacyPage } from '../pages/PrivacyPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';
import { PublicOnlyRoute } from './PublicOnlyRoute.jsx';
import { ROUTES } from '../constants/app.js';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: ROUTES.HOME, element: <LandingPage /> },
      { path: ROUTES.ABOUT, element: <AboutPage /> },
      { path: ROUTES.PRIVACY, element: <PrivacyPage /> },
    ],
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: ROUTES.LOGIN, element: <LoginPage /> },
          { path: ROUTES.SIGNUP, element: <SignupPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        errorElement: <NotFoundPage />,
        children: [
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.TIMELINE, element: <TimelinePage /> },
          { path: ROUTES.INSIGHTS, element: <InsightsPage /> },
          { path: ROUTES.NARRATIVES, element: <NarrativesPage /> },
          { path: ROUTES.REPORTS, element: <ReportsPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
