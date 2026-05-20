import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  Button,
  Card,
  Loader,
  Modal,
  SymptomEntryForm,
  TimelineCard,
} from '../components/index.js';
import { useToast } from '../context/ToastContext.jsx';
import { symptomApi } from '../api/symptomApi.js';

const initialMeta = { page: 1, pageSize: 20, total: 0, totalPages: 1 };

export const TimelinePage = () => {
  const { showToast } = useToast();
  const [entries, setEntries] = useState([]);
  const [meta, setMeta] = useState(initialMeta);
  const [symptoms, setSymptoms] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalState, setModalState] = useState({ open: false, entry: null });

  const loadEntries = useCallback(
    async (page = 1) => {
      try {
        const response = await symptomApi.listEntries({ page, pageSize: initialMeta.pageSize });
        setEntries(response.data.entries);
        setMeta(response.meta ?? initialMeta);
      } catch (error) {
        showToast({ tone: 'danger', message: error.message ?? 'Failed to load timeline' });
      }
    },
    [showToast],
  );

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setIsLoading(true);
      try {
        const [entriesResponse, symptomsResponse, triggersResponse] = await Promise.all([
          symptomApi.listEntries({ page: 1, pageSize: initialMeta.pageSize }),
          symptomApi.listSymptoms(),
          symptomApi.listTriggers(),
        ]);

        if (!isMounted) return;
        setEntries(entriesResponse.data.entries);
        setMeta(entriesResponse.meta ?? initialMeta);
        setSymptoms(symptomsResponse.data.symptoms);
        setTriggers(triggersResponse.data.triggers);
      } catch (error) {
        if (!isMounted) return;
        showToast({ tone: 'danger', message: error.message ?? 'Failed to load timeline' });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

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
      await loadEntries(meta.page);
      setModalState({ open: false, entry: null });
    } catch (error) {
      showToast({ tone: 'danger', message: error.message ?? 'Failed to save entry' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entry) => {
    const confirmed = window.confirm('Delete this entry? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await symptomApi.deleteEntry(entry.publicId);
      showToast({ tone: 'success', message: 'Entry deleted' });
      const nextPage = entries.length === 1 && meta.page > 1 ? meta.page - 1 : meta.page;
      await loadEntries(nextPage);
    } catch (error) {
      showToast({ tone: 'danger', message: error.message ?? 'Failed to delete entry' });
    }
  };

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

      {isLoading ? (
        <Card>
          <Loader />
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <h2>No entries yet</h2>
          <p>Log your first symptom entry to begin building your clinical narrative.</p>
          <div style={{ marginTop: 16 }}>
            <Button icon={Plus} onClick={openCreateModal}>
              Log first entry
            </Button>
          </div>
        </Card>
      ) : (
        <div className="timeline-list">
          {entries.map((entry) => (
            <TimelineCard
              entry={entry}
              key={entry.publicId}
              onDelete={handleDelete}
              onEdit={openEditModal}
            />
          ))}
        </div>
      )}

      {meta.totalPages > 1 ? (
        <div className="pagination">
          <Button
            disabled={meta.page <= 1}
            onClick={() => loadEntries(meta.page - 1)}
            variant="secondary"
          >
            Previous
          </Button>
          <span className="pagination__status">
            Page {meta.page} of {meta.totalPages}
          </span>
          <Button
            disabled={meta.page >= meta.totalPages}
            onClick={() => loadEntries(meta.page + 1)}
            variant="secondary"
          >
            Next
          </Button>
        </div>
      ) : null}

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
    </div>
  );
};
