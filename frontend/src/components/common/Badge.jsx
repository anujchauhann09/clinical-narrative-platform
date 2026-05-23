import { cva } from 'class-variance-authority';

import { cn } from '../../utils/cn.js';

const badgeStyles = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-2xs font-medium leading-none',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-surface-2 text-muted',
        primary: 'border-primary/30 bg-primary/10 text-primary-strong',
        success: 'border-success/30 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/10 text-warning',
        danger: 'border-danger/30 bg-danger/10 text-danger',
        ai: 'border-transparent bg-ai-grad text-white',
      },
      size: {
        sm: 'text-2xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'sm' },
  },
);

export const Badge = ({ children, className, tone, size, icon: Icon, ...props }) => (
  <span className={cn(badgeStyles({ tone, size }), className)} {...props}>
    {Icon ? <Icon aria-hidden="true" size={12} strokeWidth={2.25} /> : null}
    {children}
  </span>
);
