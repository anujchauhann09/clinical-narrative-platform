import { Filter, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  Badge,
  Button,
  Card,
  Loader,
  Modal,
  SymptomEntryForm,
  TimelineFiltersModal,
  TimelineGroup,
} from '../components/index.js';
import { useToast } from '../context/ToastContext.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { useTimelineFeed } from '../hooks/useTimelineFeed.js';
import { dateService } from '../services/dateService.js';
import { symptomApi } from '../api/symptomApi.js';

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
        showToast({ tone: 'danger', message: err.message ?? 'Failed to load filter options' });
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
      showToast({ tone: 'danger', message: error.message ?? 'Failed to load timeline' });
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
      showToast({ tone: 'danger', message: err.message ?? 'Failed to save entry' });
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
      showToast({ tone: 'danger', message: err.message ?? 'Failed to delete entry' });
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

  const removeAdvancedFilter = (patch) => {
    setAdvancedFilters((current) => ({ ...current, ...patch }));
  };

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
    const label = `${advancedFilters.from ? dateService.formatDateTime(advancedFilters.from) : '…'} → ${
      advancedFilters.to ? dateService.formatDateTime(advancedFilters.to) : '…'
    }`;
    activeFilterChips.push({
      key: 'date',
      label,
      onRemove: () => removeAdvancedFilter({ from: '', to: '' }),
    });
  }
  if (advancedFilters.severityMin !== undefined || advancedFilters.severityMax !== undefined) {
    const label = `Severity ${advancedFilters.severityMin ?? 1}–${advancedFilters.severityMax ?? 10}`;
    activeFilterChips.push({
      key: 'severity',
      label,
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
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Patient journey</p>
          <h1>Timeline</h1>
        </div>
        <Button icon={Plus} onClick={openCreateModal}>
          New entry
        </Button>
      </header>

      <Card className="timeline-toolbar">
        <div className="timeline-toolbar__row">
          <label className="timeline-search field" htmlFor="timeline-search">
            <span className="timeline-search__icon" aria-hidden="true">
              <Search size={16} />
            </span>
            <input
              className="field__input timeline-search__input"
              id="timeline-search"
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search notes…"
              type="search"
              value={searchInput}
            />
          </label>

          <label className="field timeline-toolbar__sort" htmlFor="timeline-sort">
            <span className="field__label">Sort</span>
            <select
              className="field__input"
              id="timeline-sort"
              onChange={(event) => setSortValue(event.target.value)}
              value={sortValue}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <Button icon={Filter} onClick={() => setIsFilterOpen(true)} variant="secondary">
            Filters
          </Button>
        </div>

        {activeFilterChips.length > 0 || hasAnyFilter ? (
          <div className="timeline-toolbar__chips">
            {activeFilterChips.map((chip) => (
              <button
                aria-label={`Remove filter ${chip.label}`}
                className="filter-chip"
                key={chip.key}
                onClick={chip.onRemove}
                type="button"
              >
                <span>{chip.label}</span>
                <X aria-hidden="true" size={14} />
              </button>
            ))}
            {hasAnyFilter ? (
              <Button onClick={clearAllFilters} variant="ghost">
                Clear all
              </Button>
            ) : null}
          </div>
        ) : null}
      </Card>

      {isInitializing ? (
        <Card>
          <Loader />
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <h2>No entries match</h2>
          <p>
            {hasAnyFilter
              ? 'Try clearing or loosening filters to see more entries.'
              : 'Log your first symptom entry to begin building your clinical narrative.'}
          </p>
          <div style={{ marginTop: 16 }}>
            {hasAnyFilter ? (
              <Button onClick={clearAllFilters} variant="secondary">
                Clear filters
              </Button>
            ) : (
              <Button icon={Plus} onClick={openCreateModal}>
                Log first entry
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="timeline-feed">
          {groupedEntries.map(([dateKey, dayEntries]) => (
            <TimelineGroup
              dateKey={dateKey}
              entries={dayEntries}
              key={dateKey}
              onDelete={handleDelete}
              onEdit={openEditModal}
            />
          ))}

          <div className="timeline-feed__sentinel" ref={sentinelRef} aria-hidden="true" />

          {isLoadingMore ? (
            <div className="timeline-feed__more">
              <Loader />
            </div>
          ) : nextCursor ? null : (
            <div className="timeline-feed__end">
              <Badge>End of timeline</Badge>
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={modalState.open}
        onClose={closeModal}
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
    </div>
  );
};
