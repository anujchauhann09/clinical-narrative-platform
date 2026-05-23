import { ChevronDown, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '../../utils/cn.js';

export const Chip = ({ active = false, children, className, onToggle, type = 'button', ...props }) => (
  <button
    aria-pressed={active}
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium leading-none transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      active
        ? 'border-primary bg-primary text-primary-contrast shadow-soft'
        : 'border-border bg-surface text-muted hover:border-primary/40 hover:bg-primary/5 hover:text-text',
      className,
    )}
    onClick={onToggle}
    type={type}
    {...props}
  >
    {children}
  </button>
);

const sortKeys = (entries) => entries.sort(([a], [b]) => a.localeCompare(b));

const matchItem = (item, query) =>
  !query || item.name.toLowerCase().includes(query) ||
  (item.category && item.category.toLowerCase().includes(query));

export const ChipMultiSelect = ({
  emptyLabel = 'Loading…',
  groupBy,
  items = [],
  legend,
  onToggle,
  searchable = true,
  value = [],
}) => {
  const [query, setQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState(() => new Set());

  const trimmedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(
    () => (trimmedQuery ? items.filter((item) => matchItem(item, trimmedQuery)) : items),
    [items, trimmedQuery],
  );

  const grouped = useMemo(() => {
    if (!groupBy) return [['', filteredItems]];
    const map = new Map();
    for (const item of filteredItems) {
      const key = groupBy(item) ?? 'Other';
      const arr = map.get(key) ?? [];
      arr.push(item);
      map.set(key, arr);
    }
    return sortKeys(Array.from(map.entries()));
  }, [filteredItems, groupBy]);

  const selectedCount = value.length;
  const hasGroups = grouped.length > 1 || (groupBy && grouped[0]?.[0]);

  const toggleGroup = (groupLabel) => {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupLabel)) next.delete(groupLabel);
      else next.add(groupLabel);
      return next;
    });
  };

  return (
    <fieldset className="flex flex-col gap-2.5">
      {legend ? (
        <div className="flex items-center justify-between gap-2">
          <legend className="text-sm font-medium text-text">
            {legend}
            {selectedCount > 0 ? (
              <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-2xs font-semibold text-primary-strong">
                {selectedCount}
              </span>
            ) : null}
          </legend>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="text-xs text-muted">{emptyLabel}</p>
      ) : (
        <>
          {searchable && items.length > 8 ? (
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                size={14}
              />
              <input
                aria-label={`Search ${legend?.toLowerCase() ?? 'options'}`}
                className="block h-9 w-full rounded-lg border border-border bg-surface pl-9 pr-9 text-sm text-text placeholder:text-muted/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${legend?.toLowerCase() ?? ''}…`}
                type="search"
                value={query}
              />
              {query ? (
                <button
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-surface-2 hover:text-text"
                  onClick={() => setQuery('')}
                  type="button"
                >
                  <X aria-hidden="true" size={14} />
                </button>
              ) : null}
            </div>
          ) : null}

          {filteredItems.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-3 text-xs text-muted">
              No matches for &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {grouped.map(([groupLabel, groupItems]) => {
                const isCollapsed = hasGroups && collapsedGroups.has(groupLabel);
                const activeInGroup = groupItems.filter((item) =>
                  value.includes(item.publicId),
                ).length;
                return (
                  <div className="flex flex-col gap-1.5" key={groupLabel || 'all'}>
                    {groupLabel ? (
                      <button
                        aria-expanded={!isCollapsed}
                        className="flex w-fit items-center gap-1.5 text-2xs font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-text"
                        onClick={() => toggleGroup(groupLabel)}
                        type="button"
                      >
                        <ChevronDown
                          aria-hidden="true"
                          className={cn('transition-transform', isCollapsed && '-rotate-90')}
                          size={12}
                        />
                        <span>{groupLabel}</span>
                        <span className="text-muted/70">· {groupItems.length}</span>
                        {activeInGroup > 0 ? (
                          <span className="inline-flex items-center rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary-strong">
                            {activeInGroup}
                          </span>
                        ) : null}
                      </button>
                    ) : null}
                    {!isCollapsed ? (
                      <div className="flex flex-wrap gap-1.5">
                        {groupItems.map((item) => (
                          <Chip
                            active={value.includes(item.publicId)}
                            key={item.publicId}
                            onToggle={() => onToggle(item.publicId)}
                          >
                            {item.name}
                          </Chip>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </fieldset>
  );
};
