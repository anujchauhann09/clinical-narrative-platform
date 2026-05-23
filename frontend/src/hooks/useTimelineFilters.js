import { useMemo, useState } from 'react';

import { dateService } from '../services/dateService.js';
import { useDebouncedValue } from './useDebouncedValue.js';

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

const EMPTY_ADVANCED = {
  from: '',
  to: '',
  severityMin: undefined,
  severityMax: undefined,
  mood: '',
  symptomIds: [],
  triggerIds: [],
};

const DEFAULT_SORT = 'loggedAt:desc';

const lookupName = (collection, publicId) =>
  collection.find((item) => item.publicId === publicId)?.name ?? publicId.slice(0, 8);

// All the filter state for the Timeline page in one bag: the debounced search
// input, the advanced-filter form values, sort selection, the derived
// `filters` object consumed by useTimelineFeed, and the chips/clear helpers
// the toolbar renders. The page can stay declarative and only worry about
// what's submitted/displayed.
export const useTimelineFilters = ({ symptoms, triggers }) => {
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [advancedFilters, setAdvancedFilters] = useState(EMPTY_ADVANCED);
  const [sortValue, setSortValue] = useState(DEFAULT_SORT);

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

  const applyAdvanced = (next) => {
    setAdvancedFilters({
      from: next.from || '',
      to: next.to || '',
      severityMin: next.severityMin,
      severityMax: next.severityMax,
      mood: next.mood ?? '',
      symptomIds: next.symptomIds ?? [],
      triggerIds: next.triggerIds ?? [],
    });
  };

  const patchAdvanced = (patch) => setAdvancedFilters((current) => ({ ...current, ...patch }));

  const clearAll = () => {
    setSearchInput('');
    setAdvancedFilters(EMPTY_ADVANCED);
  };

  const chips = useMemo(() => {
    const list = [];
    if (advancedFilters.from || advancedFilters.to) {
      list.push({
        key: 'date',
        label: `${advancedFilters.from ? dateService.formatDateTime(advancedFilters.from) : '…'} → ${
          advancedFilters.to ? dateService.formatDateTime(advancedFilters.to) : '…'
        }`,
        onRemove: () => patchAdvanced({ from: '', to: '' }),
      });
    }
    if (advancedFilters.severityMin !== undefined || advancedFilters.severityMax !== undefined) {
      list.push({
        key: 'severity',
        label: `Severity ${advancedFilters.severityMin ?? 1}–${advancedFilters.severityMax ?? 10}`,
        onRemove: () => patchAdvanced({ severityMin: undefined, severityMax: undefined }),
      });
    }
    if (advancedFilters.mood) {
      list.push({
        key: 'mood',
        label: `Mood: ${advancedFilters.mood}`,
        onRemove: () => patchAdvanced({ mood: '' }),
      });
    }
    for (const id of advancedFilters.symptomIds) {
      list.push({
        key: `symptom-${id}`,
        label: `Symptom: ${lookupName(symptoms, id)}`,
        onRemove: () =>
          patchAdvanced({
            symptomIds: advancedFilters.symptomIds.filter((existing) => existing !== id),
          }),
      });
    }
    for (const id of advancedFilters.triggerIds) {
      list.push({
        key: `trigger-${id}`,
        label: `Trigger: ${lookupName(triggers, id)}`,
        onRemove: () =>
          patchAdvanced({
            triggerIds: advancedFilters.triggerIds.filter((existing) => existing !== id),
          }),
      });
    }
    return list;
  }, [advancedFilters, symptoms, triggers]);

  const hasAnyFilter =
    searchInput.trim().length > 0 || chips.length > 0 || sortValue !== DEFAULT_SORT;

  return {
    searchInput,
    setSearchInput,
    advancedFilters,
    applyAdvanced,
    sortValue,
    setSortValue,
    filters,
    chips,
    hasAnyFilter,
    clearAll,
  };
};
