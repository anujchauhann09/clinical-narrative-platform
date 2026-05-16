import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from '../layouts/AppLayout.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { InsightsPage } from '../pages/InsightsPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { ProfilePage } from '../pages/ProfilePage.jsx';
import { TimelinePage } from '../pages/TimelinePage.jsx';
import { ROUTES } from '../constants/app.js';

export const router = createBrowserRouter([
  {
    path: ROUTES.HOME,
    element: <AppLayout />,
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: ROUTES.TIMELINE, element: <TimelinePage /> },
      { path: ROUTES.INSIGHTS, element: <InsightsPage /> },
      { path: ROUTES.PROFILE, element: <ProfilePage /> },
    ],
  },
]);
