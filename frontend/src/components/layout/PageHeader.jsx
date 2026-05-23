import { cn } from '../../utils/cn.js';

export const PageHeader = ({ actions, className, description, eyebrow, title }) => (
  <header
    className={cn(
      'flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-6',
      className,
    )}
  >
    <div className="min-w-0">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-1.5 text-[22px] font-semibold tracking-tight text-text md:text-[26px] md:leading-[1.2]">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted md:text-[15px]">
          {description}
        </p>
      ) : null}
    </div>
    {actions ? (
      <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
    ) : null}
  </header>
);

const MAX_WIDTHS = {
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const Container = ({ children, className, maxWidth = '6xl' }) => (
  <div
    className={cn(
      'mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10',
      MAX_WIDTHS[maxWidth] ?? MAX_WIDTHS['6xl'],
      className,
    )}
  >
    {children}
  </div>
);
