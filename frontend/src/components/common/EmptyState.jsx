import { cn } from '../../utils/cn.js';

export const EmptyState = ({ action, className, description, icon: Icon, title }) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface px-6 py-10 text-center md:py-12',
      className,
    )}
  >
    {Icon ? (
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden="true" size={20} />
      </span>
    ) : null}
    {title ? <h3 className="m-0 text-[15px] font-semibold text-text md:text-base">{title}</h3> : null}
    {description ? (
      <p className="m-0 max-w-md text-[13px] leading-relaxed text-muted md:text-sm">{description}</p>
    ) : null}
    {action ? <div className="mt-1.5">{action}</div> : null}
  </div>
);
