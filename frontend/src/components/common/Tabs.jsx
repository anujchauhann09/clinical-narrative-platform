import { createContext, useContext, useId } from 'react';

import { cn } from '../../utils/cn.js';

const TabsContext = createContext(null);

const useTabsContext = () => {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs.* must be used inside <Tabs>');
  return ctx;
};

const Root = ({ children, className, onValueChange, value }) => {
  const baseId = useId();
  return (
    <TabsContext.Provider value={{ baseId, value, onValueChange }}>
      <div className={cn('flex flex-col gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const List = ({ children, className }) => (
  <div
    className={cn(
      'inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1 shadow-soft',
      className,
    )}
    role="tablist"
  >
    {children}
  </div>
);

const Trigger = ({ children, className, value: triggerValue }) => {
  const { baseId, value, onValueChange } = useTabsContext();
  const isActive = value === triggerValue;
  return (
    <button
      aria-controls={`${baseId}-panel-${triggerValue}`}
      aria-selected={isActive}
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary text-primary-contrast shadow-soft'
          : 'text-muted hover:bg-surface-2 hover:text-text',
        className,
      )}
      id={`${baseId}-trigger-${triggerValue}`}
      onClick={() => onValueChange?.(triggerValue)}
      role="tab"
      type="button"
    >
      {children}
    </button>
  );
};

const Content = ({ children, className, value: contentValue }) => {
  const { baseId, value } = useTabsContext();
  if (value !== contentValue) return null;
  return (
    <div
      aria-labelledby={`${baseId}-trigger-${contentValue}`}
      className={cn('outline-none', className)}
      id={`${baseId}-panel-${contentValue}`}
      role="tabpanel"
      tabIndex={0}
    >
      {children}
    </div>
  );
};

export const Tabs = Object.assign(Root, { List, Trigger, Content });
