import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

import { Button } from '../common/Button.jsx';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { UserMenu } from './UserMenu.jsx';
import { cn } from '../../utils/cn.js';

export const Topbar = ({
  onCollapseToggle,
  onLogout,
  onMobileMenuToggle,
  sidebarCollapsed,
  user,
}) => {
  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur md:px-6',
        'glass-panel',
      )}
    >
      <Button
        aria-label="Open menu"
        className="lg:hidden"
        icon={Menu}
        onClick={onMobileMenuToggle}
        size="icon"
        variant="ghost"
      />
      <Button
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="hidden lg:inline-flex"
        icon={sidebarCollapsed ? PanelLeftOpen : PanelLeftClose}
        onClick={onCollapseToggle}
        size="icon"
        variant="ghost"
      />

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle className="hidden sm:inline-flex" />
        <UserMenu onLogout={onLogout} user={user} />
      </div>
    </header>
  );
};
