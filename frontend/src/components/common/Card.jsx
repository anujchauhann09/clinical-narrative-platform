import { forwardRef } from 'react';

import { cn } from '../../utils/cn.js';

const Root = forwardRef(
  ({ as: Component = 'section', className, interactive = false, ...props }, ref) => (
    <Component
      className={cn(
        'rounded-2xl border border-border bg-surface text-text shadow-soft',
        interactive &&
          'transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-elevated',
        className,
      )}
      ref={ref}
      {...props}
    />
  ),
);
Root.displayName = 'Card';

const PADDING_MAP = {
  sm: 'p-4 md:p-5',
  md: 'p-5 md:p-6',
  lg: 'p-6 md:p-7',
};

const HEADER_PADDING_MAP = {
  sm: 'px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-3.5',
  md: 'px-5 pt-5 pb-3.5 md:px-6 md:pt-6 md:pb-4',
  lg: 'px-6 pt-6 pb-4 md:px-7 md:pt-7 md:pb-4',
};

const BODY_PADDING_MAP = {
  sm: 'px-4 pb-4 md:px-5 md:pb-5',
  md: 'px-5 pb-5 md:px-6 md:pb-6',
  lg: 'px-6 pb-6 md:px-7 md:pb-7',
};

const FOOTER_PADDING_MAP = {
  sm: 'px-4 py-3 md:px-5',
  md: 'px-5 py-3.5 md:px-6',
  lg: 'px-6 py-4 md:px-7',
};

const Header = ({ className, padding = 'md', ...props }) => (
  <header
    className={cn(
      'flex items-start justify-between gap-3',
      HEADER_PADDING_MAP[padding] ?? HEADER_PADDING_MAP.md,
      className,
    )}
    {...props}
  />
);

const Title = ({ as: Component = 'h2', className, ...props }) => (
  <Component
    className={cn(
      'm-0 text-[15px] font-semibold tracking-tight text-text md:text-base',
      className,
    )}
    {...props}
  />
);

const Subtitle = ({ className, ...props }) => (
  <p className={cn('mt-1 text-[13px] text-muted md:text-sm', className)} {...props} />
);

const Body = ({ className, padding = 'md', ...props }) => (
  <div className={cn(BODY_PADDING_MAP[padding] ?? BODY_PADDING_MAP.md, className)} {...props} />
);

const Footer = ({ className, padding = 'md', ...props }) => (
  <footer
    className={cn(
      'flex items-center justify-end gap-2 border-t border-border',
      FOOTER_PADDING_MAP[padding] ?? FOOTER_PADDING_MAP.md,
      className,
    )}
    {...props}
  />
);

const Pad = ({ className, padding = 'md', ...props }) => (
  <div className={cn(PADDING_MAP[padding] ?? PADDING_MAP.md, className)} {...props} />
);

export const Card = Object.assign(Root, { Header, Title, Subtitle, Body, Footer, Pad });
