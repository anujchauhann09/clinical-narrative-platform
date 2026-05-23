import { Activity, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { Button } from '../components/common/Button.jsx';
import { ThemeToggle } from '../components/common/ThemeToggle.jsx';
import { APP_NAME, ROUTES } from '../constants/app.js';
import { signOut } from '../services/authService.js';
import { useAuthStore } from '../store/authStore.js';
import { cn } from '../utils/cn.js';

const NAV_LINKS = [
  { to: ROUTES.HOME, label: 'Home', end: true },
  { to: ROUTES.ABOUT, label: 'About' },
  { to: ROUTES.PRIVACY, label: 'Privacy' },
];

export const PublicLayout = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await signOut();
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link className="flex items-center gap-3" onClick={closeMenu} to={ROUTES.HOME}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ai-grad text-white shadow-glow">
              <Activity aria-hidden="true" size={18} />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-text">{APP_NAME}</span>
              <span className="text-2xs uppercase tracking-wider text-muted">Clinical AI</span>
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted hover:text-text',
                  )
                }
                end={link.end}
                key={link.to}
                to={link.to}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Button as={Link} icon={LayoutDashboard} to={ROUTES.DASHBOARD} variant="secondary">
                  Dashboard
                </Button>
                <Button icon={LogOut} onClick={handleLogout} variant="ghost">
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to={ROUTES.LOGIN} variant="ghost">
                  Sign in
                </Button>
                <Button as={Link} to={ROUTES.SIGNUP}>
                  Get started
                </Button>
              </>
            )}
          </div>

          <button
            aria-label="Toggle menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted md:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
            type="button"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-border bg-surface md:hidden">
            <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3">
              {NAV_LINKS.map((link) => (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2 text-sm font-medium',
                      isActive ? 'bg-primary/10 text-primary-strong' : 'text-muted hover:bg-surface-2 hover:text-text',
                    )
                  }
                  end={link.end}
                  key={link.to}
                  onClick={closeMenu}
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="mt-2 flex flex-col gap-2">
                <ThemeToggle className="self-start" />
                {isAuthenticated ? (
                  <>
                    <Button as={Link} icon={LayoutDashboard} onClick={closeMenu} to={ROUTES.DASHBOARD} variant="secondary">
                      Dashboard
                    </Button>
                    <Button icon={LogOut} onClick={handleLogout} variant="ghost">
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button as={Link} onClick={closeMenu} to={ROUTES.LOGIN} variant="ghost">
                      Sign in
                    </Button>
                    <Button as={Link} onClick={closeMenu} to={ROUTES.SIGNUP}>
                      Get started
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 md:flex-row md:px-8">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-ai-grad text-white">
              <Activity aria-hidden="true" size={14} />
            </span>
            <span>{APP_NAME}</span>
          </div>
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
