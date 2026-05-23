import { cn } from '../../utils/cn.js';

export const ProfileDetailRow = ({ icon: Icon, label, mono, value }) => (
  <div className="flex items-start gap-3">
    {Icon ? (
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon aria-hidden="true" size={16} />
      </span>
    ) : (
      <span aria-hidden="true" className="h-9 w-9 shrink-0" />
    )}
    <div className="min-w-0">
      <p className="m-0 text-2xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p
        className={cn(
          'm-0 truncate',
          mono ? 'font-mono text-xs text-text' : 'text-sm text-text',
        )}
      >
        {value || '—'}
      </p>
    </div>
  </div>
);
