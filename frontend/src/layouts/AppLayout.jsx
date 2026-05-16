import { Activity, Brain, CalendarDays, UserRound } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

import { APP_NAME, ROUTES } from '../constants/app.js';
import { ToastProvider } from '../context/ToastContext.jsx';

const navItems = [
  { to: ROUTES.HOME, label: 'Overview', icon: Activity },
  { to: ROUTES.TIMELINE, label: 'Timeline', icon: CalendarDays },
  { to: ROUTES.INSIGHTS, label: 'Insights', icon: Brain },
  { to: ROUTES.PROFILE, label: 'Profile', icon: UserRound },
];

export const AppLayout = () => (
  <ToastProvider>
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__mark">CN</span>
          <span>{APP_NAME}</span>
        </div>
        <nav className="sidebar__nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink className="sidebar__link" end={item.to === ROUTES.HOME} key={item.to} to={item.to}>
              <item.icon aria-hidden="true" size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  </ToastProvider>
);
