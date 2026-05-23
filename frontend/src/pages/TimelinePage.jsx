import { motion } from 'framer-motion';
import { CalendarDays, Filter, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { symptomApi } from '../api/symptomApi.js';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Select } from '../components/common/Select.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { SymptomEntryForm } from '../components/forms/SymptomEntryForm.jsx';
import { TimelineFiltersModal } from '../components/timeline/TimelineFiltersModal.jsx';
import { TimelineGroup } from '../components/timeline/TimelineGroup.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useTimelineFeed } from '../hooks/useTimelineFeed.js';
import { dateService } from '../services/dateService.js';
import { pageFadeRise } from '../services/motions.js';

const EMPTY_FILTERS = {
  pageSize: 20,
  sortBy: 'loggedAt',
  sortOrder: 'desc',
  from: '',
  to: '',
  severityMin: undefined,
  severityMax: undefined,
  mood: '',
  search: '',
  symptomIds: [],
  triggerIds: [],
};

const SORT_OPTIONS = [
  { value: 'loggedAt:desc', label: 'Newest first' },
  { value: 'loggedAt:asc', label: 'Oldest first' },
  { value: 'severity:desc', label: 'Highest severity' },
  { value: 'severity:asc', label: 'Lowest severity' },
  { value: 'createdAt:desc', label: 'Recently logged' },
];

const groupEntriesByDay = (entries) => {
  const groups = new Map();
  for (const entry of entries) {
    const key = dateService.localDateKey(entry.loggedAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return Array.from(groups.entries());
};

const lookupName = (collection, publicId) =>
  collection.find((item) => item.publicId === publicId)?.name ?? publicId.slice(0, 8);

export const TimelinePage = () => {
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [advancedFilters, setAdvancedFilters] = useState({
    from: '',
    to: '',
    severityMin: undefined,
    severityMax: undefined,
    mood: '',
    symptomIds: [],
    triggerIds: [],
  });
  const [sortValue, setSortValue] = useState('loggedAt:desc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [modalState, setModalState] = useState({ open: false, entry: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const sentinelRef = useRef(null);

  const filters = useMemo(() => {
    const [sortBy, sortOrder] = sortValue.split(':');
    return {
      ...EMPTY_FILTERS,
      ...advancedFilters,
      search: debouncedSearch.trim(),
      sortBy,
      sortOrder,
    };
  }, [advancedFilters, debouncedSearch, sortValue]);

  const { entries, nextCursor, isInitializing, isLoadingMore, error, loadMore, refresh, removeEntry } =
    useTimelineFeed(filters);

  useEffect(() => {
    let isMounted = true;
    Promise.all([symptomApi.listSymptoms(), symptomApi.listTriggers()])
      .then(([symptomsResponse, triggersResponse]) => {
        if (!isMounted) return;
        setSymptoms(symptomsResponse.data.symptoms);
        setTriggers(triggersResponse.data.triggers);
      })
      .catch((err) => {
        if (!isMounted) return;
        showToast({ tone: 'danger', message: err?.message ?? 'Failed to load filter options' });
      });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  useEffect(() => {
    if (!nextCursor) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (observed) => {
        if (observed[0].isIntersecting) loadMore();
      },
      { rootMargin: '240px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [nextCursor, loadMore]);

  useEffect(() => {
    if (error) {
      showToast({ tone: 'danger', message: error?.message ?? 'Failed to load timeline' });
    }
  }, [error, showToast]);

  const groupedEntries = useMemo(() => groupEntriesByDay(entries), [entries]);

  const openCreateModal = () => setModalState({ open: true, entry: null });
  const openEditModal = (entry) => setModalState({ open: true, entry });
  const closeModal = () => {
    if (isSubmitting) return;
    setModalState({ open: false, entry: null });
  };

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      if (modalState.entry) {
        await symptomApi.updateEntry(modalState.entry.publicId, payload);
        showToast({ tone: 'success', message: 'Entry updated' });
      } else {
        await symptomApi.createEntry(payload);
        showToast({ tone: 'success', message: 'Entry logged' });
      }
      await refresh();
      setModalState({ open: false, entry: null });
    } catch (err) {
      showToast({ tone: 'danger', message: err?.message ?? 'Failed to save entry' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entry) => {
    const confirmed = window.confirm('Delete this entry? This action cannot be undone.');
    if (!confirmed) return;
    try {
      await symptomApi.deleteEntry(entry.publicId);
      removeEntry(entry.publicId);
      showToast({ tone: 'success', message: 'Entry deleted' });
    } catch (err) {
      showToast({ tone: 'danger', message: err?.message ?? 'Failed to delete entry' });
    }
  };

  const handleApplyFilters = (next) => {
    setAdvancedFilters({
      from: next.from || '',
      to: next.to || '',
      severityMin: next.severityMin,
      severityMax: next.severityMax,
      mood: next.mood ?? '',
      symptomIds: next.symptomIds ?? [],
      triggerIds: next.triggerIds ?? [],
    });
    setIsFilterOpen(false);
  };

  const removeAdvancedFilter = (patch) =>
    setAdvancedFilters((current) => ({ ...current, ...patch }));

  const clearAllFilters = () => {
    setSearchInput('');
    setAdvancedFilters({
      from: '',
      to: '',
      severityMin: undefined,
      severityMax: undefined,
      mood: '',
      symptomIds: [],
      triggerIds: [],
    });
  };

  const activeFilterChips = [];
  if (advancedFilters.from || advancedFilters.to) {
    activeFilterChips.push({
      key: 'date',
      label: `${advancedFilters.from ? dateService.formatDateTime(advancedFilters.from) : '…'} → ${
        advancedFilters.to ? dateService.formatDateTime(advancedFilters.to) : '…'
      }`,
      onRemove: () => removeAdvancedFilter({ from: '', to: '' }),
    });
  }
  if (advancedFilters.severityMin !== undefined || advancedFilters.severityMax !== undefined) {
    activeFilterChips.push({
      key: 'severity',
      label: `Severity ${advancedFilters.severityMin ?? 1}–${advancedFilters.severityMax ?? 10}`,
      onRemove: () =>
        removeAdvancedFilter({ severityMin: undefined, severityMax: undefined }),
    });
  }
  if (advancedFilters.mood) {
    activeFilterChips.push({
      key: 'mood',
      label: `Mood: ${advancedFilters.mood}`,
      onRemove: () => removeAdvancedFilter({ mood: '' }),
    });
  }
  advancedFilters.symptomIds.forEach((id) => {
    activeFilterChips.push({
      key: `symptom-${id}`,
      label: `Symptom: ${lookupName(symptoms, id)}`,
      onRemove: () =>
        removeAdvancedFilter({
          symptomIds: advancedFilters.symptomIds.filter((existing) => existing !== id),
        }),
    });
  });
  advancedFilters.triggerIds.forEach((id) => {
    activeFilterChips.push({
      key: `trigger-${id}`,
      label: `Trigger: ${lookupName(triggers, id)}`,
      onRemove: () =>
        removeAdvancedFilter({
          triggerIds: advancedFilters.triggerIds.filter((existing) => existing !== id),
        }),
    });
  });

  const hasAnyFilter =
    searchInput.trim().length > 0 || activeFilterChips.length > 0 || sortValue !== 'loggedAt:desc';

  return (
    <Container>
      <motion.div className="flex flex-col gap-5 md:gap-6" {...pageFadeRise}>
        <PageHeader
          actions={
            <Button icon={Plus} onClick={openCreateModal}>
              New entry
            </Button>
          }
          description="Every entry, severity, and trigger you have logged — searchable, filterable, chronological."
          eyebrow="Patient journey"
          title="Timeline"
        />

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
                onClick={() => setIsFilterOpen(true)}
                size="sm"
                variant="secondary"
              >
                Filters
                {activeFilterChips.length > 0 ? (
                  <span className="ml-1 inline-flex items-center rounded-full bg-primary px-1.5 py-0 text-[10px] font-semibold text-primary-contrast">
                    {activeFilterChips.length}
                  </span>
                ) : null}
              </Button>
            </div>

            {activeFilterChips.length > 0 || hasAnyFilter ? (
              <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
                {activeFilterChips.map((chip) => (
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
                  <Button className="ml-auto" onClick={clearAllFilters} size="sm" variant="ghost">
                    Clear all
                  </Button>
                ) : null}
              </div>
            ) : null}
          </Card.Pad>
        </Card>

        {isInitializing ? (
          <Card>
            <Card.Body>
              <Loader />
            </Card.Body>
          </Card>
        ) : entries.length === 0 ? (
          <EmptyState
            action={
              hasAnyFilter ? (
                <Button onClick={clearAllFilters} variant="secondary">
                  Clear filters
                </Button>
              ) : (
                <Button icon={Plus} onClick={openCreateModal}>
                  Log first entry
                </Button>
              )
            }
            description={
              hasAnyFilter
                ? 'Try clearing or loosening filters to see more entries.'
                : 'Log your first symptom entry to begin building your clinical narrative.'
            }
            icon={CalendarDays}
            title={hasAnyFilter ? 'No entries match' : 'No entries yet'}
          />
        ) : (
          <div className="flex flex-col gap-6">
            {groupedEntries.map(([dateKey, dayEntries]) => (
              <TimelineGroup
                dateKey={dateKey}
                entries={dayEntries}
                key={dateKey}
                onDelete={handleDelete}
                onEdit={openEditModal}
              />
            ))}

            <div aria-hidden="true" className="h-px" ref={sentinelRef} />

            {isLoadingMore ? (
              <div className="flex justify-center py-3">
                <Loader />
              </div>
            ) : nextCursor ? null : (
              <div className="flex justify-center py-3">
                <Badge>End of timeline</Badge>
              </div>
            )}
          </div>
        )}
      </motion.div>

      <Modal
        isOpen={modalState.open}
        onClose={closeModal}
        size="lg"
        title={modalState.entry ? 'Edit symptom entry' : 'Log a new symptom entry'}
      >
        <SymptomEntryForm
          entry={modalState.entry}
          isSubmitting={isSubmitting}
          onCancel={closeModal}
          onSubmit={handleSubmit}
          submitLabel={modalState.entry ? 'Save changes' : 'Save entry'}
          symptoms={symptoms}
          triggers={triggers}
        />
      </Modal>

      <TimelineFiltersModal
        filters={advancedFilters}
        isOpen={isFilterOpen}
        onApply={handleApplyFilters}
        onClose={() => setIsFilterOpen(false)}
        symptoms={symptoms}
        triggers={triggers}
      />
    </Container>
  );
};
