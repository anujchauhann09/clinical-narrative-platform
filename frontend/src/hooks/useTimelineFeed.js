import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { symptomApi } from '../api/symptomApi.js';

const buildQuery = (filters, cursor) => {
  const query = {
    pageSize: filters.pageSize ?? 20,
    sortBy: filters.sortBy ?? 'loggedAt',
    sortOrder: filters.sortOrder ?? 'desc',
  };

  if (cursor) query.cursor = cursor;
  if (filters.from) query.from = filters.from;
  if (filters.to) query.to = filters.to;
  if (filters.severityMin) query.severityMin = filters.severityMin;
  if (filters.severityMax) query.severityMax = filters.severityMax;
  if (filters.mood) query.mood = filters.mood;
  if (filters.search) query.search = filters.search;
  if (filters.symptomIds?.length) query.symptomIds = filters.symptomIds.join(',');
  if (filters.triggerIds?.length) query.triggerIds = filters.triggerIds.join(',');

  return query;
};

export const useTimelineFeed = (filters) => {
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  const [entries, setEntries] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const inFlightToken = useRef(0);

  useEffect(() => {
    const token = ++inFlightToken.current;
    setIsInitializing(true);
    setError(null);

    symptomApi
      .listEntries(buildQuery(filters))
      .then((response) => {
        if (token !== inFlightToken.current) return;
        setEntries(response.data.entries);
        setNextCursor(response.data.nextCursor);
      })
      .catch((err) => {
        if (token !== inFlightToken.current) return;
        setError(err);
        setEntries([]);
        setNextCursor(null);
      })
      .finally(() => {
        if (token !== inFlightToken.current) return;
        setIsInitializing(false);
      });
    // filtersKey is the deep-equality dep; filters object is referenced inside.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const response = await symptomApi.listEntries(buildQuery(filters, nextCursor));
      setEntries((prev) => [...prev, ...response.data.entries]);
      setNextCursor(response.data.nextCursor);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, nextCursor, isLoadingMore]);

  const refresh = useCallback(async () => {
    const token = ++inFlightToken.current;
    setIsInitializing(true);
    try {
      const response = await symptomApi.listEntries(buildQuery(filters));
      if (token !== inFlightToken.current) return;
      setEntries(response.data.entries);
      setNextCursor(response.data.nextCursor);
      setError(null);
    } catch (err) {
      if (token !== inFlightToken.current) return;
      setError(err);
    } finally {
      if (token === inFlightToken.current) setIsInitializing(false);
    }
  }, [filters]);

  const removeEntry = useCallback((publicId) => {
    setEntries((prev) => prev.filter((entry) => entry.publicId !== publicId));
  }, []);

  return {
    entries,
    nextCursor,
    isInitializing,
    isLoadingMore,
    error,
    loadMore,
    refresh,
    removeEntry,
  };
};
