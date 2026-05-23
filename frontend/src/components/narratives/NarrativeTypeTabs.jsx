import { cn } from '../../utils/cn.js';
import { NARRATIVE_TYPE_LIST } from './narrativeTypes.js';

export const NarrativeTypeTabs = ({ activeKey, onChange, summariesByType }) => (
  <div
    aria-label="Narrative type"
    className="inline-flex w-full overflow-x-auto rounded-2xl border border-border bg-surface p-1.5 shadow-soft scrollbar-thin"
    role="tablist"
  >
    {NARRATIVE_TYPE_LIST.map((type) => {
      const Icon = type.icon;
      const active = type.key === activeKey;
      const count = summariesByType.get(type.key)?.length ?? 0;
      return (
        <button
          aria-controls={`narrative-panel-${type.key}`}
          aria-selected={active}
          className={cn(
            'group relative inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
            active
              ? 'bg-primary text-primary-contrast shadow-soft'
              : 'text-muted hover:bg-surface-2 hover:text-text',
          )}
          id={`narrative-tab-${type.key}`}
          key={type.key}
          onClick={() => onChange(type.key)}
          role="tab"
          type="button"
        >
          <Icon aria-hidden="true" size={15} strokeWidth={2} />
          <span className="hidden sm:inline">{type.label}</span>
          <span className="sm:hidden">{type.label.split(' ')[0]}</span>
          {count > 0 ? (
            <span
              className={cn(
                'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                active
                  ? 'bg-white/20 text-primary-contrast'
                  : 'bg-primary/10 text-primary-strong',
              )}
            >
              {count}
            </span>
          ) : null}
        </button>
      );
    })}
  </div>
);
