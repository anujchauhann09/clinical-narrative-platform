import { Activity, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { APP_NAME, ROUTES } from '../../constants/app.js';
import { Button } from '../common/Button.jsx';
import { cn } from '../../utils/cn.js';

export const Sidebar = ({ collapsed = false, navItems, onLogout, onNavigate }) => (
  <aside
    aria-label="Primary navigation"
    className={cn(
      'hidden lg:flex flex-col gap-6 border-r border-border bg-surface/80 backdrop-blur transition-[width] duration-200 ease-smooth',
      collapsed ? 'w-[72px] px-2 py-5' : 'w-[252px] px-4 py-5',
    )}
  >
    <NavLink className="flex items-center gap-3 px-2" end onClick={onNavigate} to={ROUTES.DASHBOARD}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-ai-grad text-white shadow-glow">
        <Activity aria-hidden="true" size={18} />
      </span>
      {!collapsed ? (
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-text">{APP_NAME}</span>
          <span className="text-2xs uppercase tracking-wider text-muted">Clinical AI</span>
        </span>
      ) : null}
    </NavLink>

    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            className={({ isActive }) =>
              cn(
                'group inline-flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'bg-primary/10 text-primary-strong'
                  : 'text-muted hover:bg-surface-2 hover:text-text',
                collapsed && 'justify-center',
              )
            }
            end={item.end}
            key={item.to}
            onClick={onNavigate}
            to={item.to}
          >
            <Icon aria-hidden="true" size={18} strokeWidth={2} />
            {!collapsed ? <span>{item.label}</span> : null}
            {!collapsed && item.badge ? (
              <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-2xs font-semibold text-primary-strong">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        );
      })}
    </nav>

    <div className="mt-auto flex flex-col gap-2">
      <Button
        className={cn('justify-start', collapsed && 'justify-center px-0')}
        icon={LogOut}
        onClick={onLogout}
        variant="ghost"
      >
        {!collapsed ? 'Sign out' : null}
      </Button>
    </div>
  </aside>
);
