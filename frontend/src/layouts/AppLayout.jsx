import { Activity, Brain, CalendarDays, UserRound } from 'lucide-react';
import { LogOut } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '../components/Button.jsx';
import { APP_NAME, ROUTES } from '../constants/app.js';
import { ToastProvider } from '../context/ToastContext.jsx';
import { authApi } from '../api/authApi.js';
import { useAuthStore } from '../store/authStore.js';

const navItems = [
  { to: ROUTES.DASHBOARD, label: 'Overview', icon: Activity },
  { to: ROUTES.TIMELINE, label: 'Timeline', icon: CalendarDays },
  { to: ROUTES.INSIGHTS, label: 'Insights', icon: Brain },
  { to: ROUTES.PROFILE, label: 'Profile', icon: UserRound },
];

export const AppLayout = () => {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
      navigate(ROUTES.LOGIN, { replace: true });
    }
  };

  return (
    <ToastProvider>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="sidebar__brand">
            <span className="sidebar__mark">CN</span>
            <span>{APP_NAME}</span>
          </div>
          <nav className="sidebar__nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink className="sidebar__link" end={item.to === ROUTES.DASHBOARD} key={item.to} to={item.to}>
                <item.icon aria-hidden="true" size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <Button className="sidebar__logout" icon={LogOut} onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </aside>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
};
