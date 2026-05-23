import { AnimatePresence, motion } from 'framer-motion';
import { Activity, LogOut, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { APP_NAME, ROUTES } from '../../constants/app.js';
import { backdropFade } from '../../services/motions.js';
import { Button } from '../common/Button.jsx';
import { cn } from '../../utils/cn.js';

export const MobileNav = ({ isOpen, navItems, onClose, onLogout }) => (
  <AnimatePresence>
    {isOpen ? (
      <motion.div className="fixed inset-0 z-40 lg:hidden" {...backdropFade}>
        <button
          aria-label="Close menu"
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          tabIndex={-1}
          type="button"
        />
        <motion.aside
          animate={{ x: 0 }}
          aria-label="Mobile navigation"
          className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-6 border-r border-border bg-surface px-4 py-5 shadow-elevated"
          exit={{ x: -320 }}
          initial={{ x: -320 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-ai-grad text-white shadow-glow">
                <Activity aria-hidden="true" size={18} />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-text">{APP_NAME}</span>
                <span className="text-2xs uppercase tracking-wider text-muted">Clinical AI</span>
              </span>
            </div>
            <Button aria-label="Close menu" icon={X} onClick={onClose} size="icon" variant="ghost" />
          </div>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary-strong'
                        : 'text-muted hover:bg-surface-2 hover:text-text',
                    )
                  }
                  end={item.end}
                  key={item.to}
                  onClick={onClose}
                  to={item.to === ROUTES.DASHBOARD ? item.to : item.to}
                >
                  <Icon aria-hidden="true" size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <Button className="mt-auto justify-start" icon={LogOut} onClick={onLogout} variant="ghost">
            Sign out
          </Button>
        </motion.aside>
      </motion.div>
    ) : null}
  </AnimatePresence>
);
