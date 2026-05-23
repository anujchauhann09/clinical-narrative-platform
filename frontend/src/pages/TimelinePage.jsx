import { motion } from 'framer-motion';
import { CalendarDays, Plus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { symptomApi } from '../api/symptomApi.js';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { SymptomEntryForm } from '../components/forms/SymptomEntryForm.jsx';
import { TimelineFiltersModal } from '../components/timeline/TimelineFiltersModal.jsx';
import { TimelineGroup } from '../components/timeline/TimelineGroup.jsx';
import { TimelineToolbar } from '../components/timeline/TimelineToolbar.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTimelineFeed } from '../hooks/useTimelineFeed.js';
import { useTimelineFilters } from '../hooks/useTimelineFilters.js';
import { dateService } from '../services/dateService.js';
import { pageFadeRise } from '../services/motions.js';

const groupEntriesByDay = (entries) => {
  const groups = new Map();
  for (const entry of entries) {
    const key = dateService.localDateKey(entry.loggedAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }
  return Array.from(groups.entries());
};

export const TimelinePage = () => {
  const { showToast } = useToast();
  const [symptoms, setSymptoms] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [modalState, setModalState] = useState({ open: false, entry: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sentinelRef = useRef(null);

  const {
    advancedFilters,
    applyAdvanced,
    chips,
    clearAll,
    filters,
    hasAnyFilter,
    searchInput,
    setSearchInput,
    setSortValue,
    sortValue,
  } = useTimelineFilters({ symptoms, triggers });

  const {
    entries,
    nextCursor,
    isInitializing,
    isLoadingMore,
    error,
    loadMore,
    refresh,
    removeEntry,
  } = useTimelineFeed(filters);

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

  // Infinite scroll: load the next page when the sentinel is near the viewport.
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
    if (error) showToast({ tone: 'danger', message: error?.message ?? 'Failed to load timeline' });
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

        <TimelineToolbar
          chips={chips}
          hasAnyFilter={hasAnyFilter}
          onClearAll={clearAll}
          onOpenFilters={() => setIsFilterOpen(true)}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          setSortValue={setSortValue}
          sortValue={sortValue}
        />

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
                <Button onClick={clearAll} variant="secondary">
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
        onApply={(next) => {
          applyAdvanced(next);
          setIsFilterOpen(false);
        }}
        onClose={() => setIsFilterOpen(false)}
        symptoms={symptoms}
        triggers={triggers}
      />
    </Container>
  );
};
