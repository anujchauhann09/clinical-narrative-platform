import { Monitor, Moon, Sun } from 'lucide-react';

import { THEME_OPTIONS } from '../../store/themeStore.js';
import { useTheme } from '../../hooks/useTheme.js';
import { cn } from '../../utils/cn.js';

const OPTIONS = [
  { value: THEME_OPTIONS.LIGHT, label: 'Light', icon: Sun },
  { value: THEME_OPTIONS.SYSTEM, label: 'System', icon: Monitor },
  { value: THEME_OPTIONS.DARK, label: 'Dark', icon: Moon },
];

export const ThemeToggle = ({ className }) => {
  const { mode, setMode } = useTheme();

  return (
    <div
      aria-label="Theme"
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5 text-muted shadow-soft',
        className,
      )}
      role="radiogroup"
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const isActive = mode === option.value;
        return (
          <button
            aria-checked={isActive}
            aria-label={`${option.label} theme`}
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-full transition-colors',
              'hover:text-text focus-visible:outline-none',
              isActive && 'bg-primary text-primary-contrast shadow-soft',
            )}
            key={option.value}
            onClick={() => setMode(option.value)}
            role="radio"
            type="button"
          >
            <Icon aria-hidden="true" size={14} strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
};
