import { Activity } from 'lucide-react';
import { Outlet } from 'react-router-dom';

import { APP_NAME } from '../constants/app.js';
import { ToastProvider } from '../context/ToastContext.jsx';

export const AuthLayout = () => (
  <ToastProvider>
    <main className="auth-shell">
      <section className="auth-panel" aria-label="Authentication">
        <div className="auth-brand">
          <span className="sidebar__mark">
            <Activity aria-hidden="true" size={18} />
          </span>
          <span>{APP_NAME}</span>
        </div>
        <Outlet />
      </section>
    </main>
  </ToastProvider>
);
