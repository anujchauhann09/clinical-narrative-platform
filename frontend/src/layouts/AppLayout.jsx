import { Activity, Brain, CalendarDays, FileDown, FileText, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { CopilotFab } from '../components/copilot/CopilotFab.jsx';
import { MobileNav, Sidebar, Topbar } from '../components/layout/index.js';
import { ROUTES } from '../constants/app.js';
import { ToastProvider } from '../context/ToastContext.jsx';
import { signOut } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';

const NAV_ITEMS = [
  { to: ROUTES.DASHBOARD, label: 'Overview', icon: Activity, end: true },
  { to: ROUTES.TIMELINE, label: 'Timeline', icon: CalendarDays },
  { to: ROUTES.INSIGHTS, label: 'Insights', icon: Brain },
  { to: ROUTES.NARRATIVES, label: 'Narratives', icon: FileText },
  { to: ROUTES.REPORTS, label: 'Reports', icon: FileDown },
  { to: ROUTES.PROFILE, label: 'Profile', icon: UserRound },
];

export const AppLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    setMobileOpen(false);
    await signOut();
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg text-text">
        <Sidebar
          collapsed={collapsed}
          navItems={NAV_ITEMS}
          onLogout={handleLogout}
        />
        <MobileNav
          isOpen={mobileOpen}
          navItems={NAV_ITEMS}
          onClose={() => setMobileOpen(false)}
          onLogout={handleLogout}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            onCollapseToggle={() => setCollapsed((value) => !value)}
            onLogout={handleLogout}
            onMobileMenuToggle={() => setMobileOpen(true)}
            sidebarCollapsed={collapsed}
            user={user}
          />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
        <CopilotFab />
      </div>
    </ToastProvider>
  );
};
