import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { ROUTES } from '../constants/app.js';
import { useAuthStore } from '../store/authStore.js';

export const ProtectedRoute = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to={ROUTES.LOGIN} />;
  }

  return <Outlet />;
};
