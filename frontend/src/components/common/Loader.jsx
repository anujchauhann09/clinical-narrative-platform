import { Loader2 } from 'lucide-react';

import { cn } from '../../utils/cn.js';

export const Loader = ({ className, label = 'Loading', size = 18 }) => (
  <div aria-label={label} className={cn('inline-flex items-center gap-2 text-muted', className)} role="status">
    <Loader2 aria-hidden="true" className="animate-spin text-primary" size={size} />
    <span className="text-sm">{label}</span>
  </div>
);

export const Skeleton = ({ className }) => (
  <div
    aria-hidden="true"
    className={cn(
      'animate-pulse rounded-lg bg-surface-2',
      className,
    )}
  />
);
