import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ROUTES } from '../../constants/app.js';
import { cn } from '../../utils/cn.js';

const initialsFor = (value) => {
  if (!value) return 'U';
  const parts = String(value).trim().split(/[\s@]+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const UserMenu = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();

  const displayName = user?.profile?.name ?? user?.email ?? 'Patient';
  const email = user?.email ?? '';
  const initials = initialsFor(user?.profile?.name ?? user?.email);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointer = (event) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) setIsOpen(false);
    };
    const handleKey = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  const handleNavigate = (route) => {
    setIsOpen(false);
    navigate(route);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout?.();
  };

  const items = [
    {
      key: 'profile',
      label: 'Profile',
      description: 'View account info',
      icon: UserRound,
      onClick: () => handleNavigate(ROUTES.PROFILE),
    },
    {
      key: 'settings',
      label: 'Settings',
      description: 'Theme and preferences',
      icon: Settings,
      onClick: () => handleNavigate(ROUTES.SETTINGS),
    },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-controls={menuId}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2 py-1 pr-2.5 text-text shadow-soft transition-colors',
          'hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          isOpen && 'bg-surface-2',
        )}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        <span
          aria-hidden="true"
          className="grid h-7 w-7 place-items-center rounded-full bg-ai-grad text-2xs font-semibold text-white"
        >
          {initials}
        </span>
        <span className="hidden max-w-[140px] truncate text-xs font-medium md:inline">
          {displayName}
        </span>
        <ChevronDown
          aria-hidden="true"
          className={cn('text-muted transition-transform duration-150', isOpen && 'rotate-180')}
          size={14}
        />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            aria-label="Account menu"
            className="absolute right-0 mt-2 w-64 origin-top-right rounded-2xl border border-border bg-surface p-2 shadow-elevated focus:outline-none"
            exit={{ opacity: 0, y: -4 }}
            id={menuId}
            initial={{ opacity: 0, y: -4 }}
            role="menu"
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 rounded-xl px-3 py-2">
              <span
                aria-hidden="true"
                className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-ai-grad text-sm font-semibold text-white"
              >
                {initials}
              </span>
              <div className="min-w-0">
                <p className="m-0 truncate text-sm font-semibold text-text">{displayName}</p>
                {email ? (
                  <p className="m-0 truncate text-xs text-muted">{email}</p>
                ) : null}
              </div>
            </div>

            <div className="my-1 h-px bg-border" role="separator" />

            {items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
                  key={item.key}
                  onClick={item.onClick}
                  role="menuitem"
                  type="button"
                >
                  <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon aria-hidden="true" size={16} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-text">{item.label}</span>
                    <span className="text-xs text-muted">{item.description}</span>
                  </span>
                </button>
              );
            })}

            <div className="my-1 h-px bg-border" role="separator" />

            <button
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-danger transition-colors hover:bg-danger/10 focus-visible:bg-danger/10 focus-visible:outline-none"
              onClick={handleLogout}
              role="menuitem"
              type="button"
            >
              <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-danger/10">
                <LogOut aria-hidden="true" size={16} />
              </span>
              <span>Sign out</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
