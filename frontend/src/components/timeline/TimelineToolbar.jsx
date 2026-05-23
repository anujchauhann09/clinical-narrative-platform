import { Filter, Search, X } from 'lucide-react';

import { Button } from '../common/Button.jsx';
import { Card } from '../common/Card.jsx';
import { Select } from '../common/Select.jsx';

const SORT_OPTIONS = [
  { value: 'loggedAt:desc', label: 'Newest first' },
  { value: 'loggedAt:asc', label: 'Oldest first' },
  { value: 'severity:desc', label: 'Highest severity' },
  { value: 'severity:asc', label: 'Lowest severity' },
  { value: 'createdAt:desc', label: 'Recently logged' },
];

export const TimelineToolbar = ({
  chips,
  hasAnyFilter,
  onClearAll,
  onOpenFilters,
  searchInput,
  setSearchInput,
  setSortValue,
  sortValue,
}) => (
  <Card>
    <Card.Pad padding="sm" className="flex flex-col gap-3">
      <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            size={15}
          />
          <input
            aria-label="Search notes"
            className="block h-9 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-text placeholder:text-muted/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search notes…"
            type="search"
            value={searchInput}
          />
        </div>
        <Select
          aria-label="Sort entries"
          className="sm:min-w-[180px]"
          inputClassName="h-9 py-0"
          onChange={(event) => setSortValue(event.target.value)}
          value={sortValue}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Button
          className="h-9"
          icon={Filter}
          onClick={onOpenFilters}
          size="sm"
          variant="secondary"
        >
          Filters
          {chips.length > 0 ? (
            <span className="ml-1 inline-flex items-center rounded-full bg-primary px-1.5 py-0 text-[10px] font-semibold text-primary-contrast">
              {chips.length}
            </span>
          ) : null}
        </Button>
      </div>

      {chips.length > 0 || hasAnyFilter ? (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
          {chips.map((chip) => (
            <button
              aria-label={`Remove filter ${chip.label}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary-strong transition-colors hover:bg-primary/15"
              key={chip.key}
              onClick={chip.onRemove}
              type="button"
            >
              <span>{chip.label}</span>
              <X aria-hidden="true" size={12} />
            </button>
          ))}
          {hasAnyFilter ? (
            <Button className="ml-auto" onClick={onClearAll} size="sm" variant="ghost">
              Clear all
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card.Pad>
  </Card>
);
