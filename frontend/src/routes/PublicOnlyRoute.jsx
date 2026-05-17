import { Navigate, Outlet } from 'react-router-dom';

import { ROUTES } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';

export const PublicOnlyRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

  return <Outlet />;
};
