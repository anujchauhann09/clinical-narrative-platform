import { Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Badge,
  Button,
  Card,
  Loader,
  Modal,
  SymptomEntryForm,
  TimelineCard,
} from '../components/index.js';
import { ROUTES } from '../constants/app.js';
import { useToast } from '../context/ToastContext.jsx';
import { symptomApi } from '../api/symptomApi.js';

const initialSummary = {
  entriesThisMonth: 0,
  averageSeverityThisMonth: 0,
  totalEntries: 0,
  averageSeverity: 0,
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [summary, setSummary] = useState(initialSummary);
  const [recentEntries, setRecentEntries] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refresh = useCallback(async () => {
    const [entriesResponse, summaryResponse] = await Promise.all([
      symptomApi.listEntries({ page: 1, pageSize: 3 }),
      symptomApi.getSummary(),
    ]);
    setRecentEntries(entriesResponse.data.entries);
    setSummary(summaryResponse.data.summary);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      setIsLoading(true);
      try {
        const [entriesResponse, summaryResponse, symptomsResponse, triggersResponse] =
          await Promise.all([
            symptomApi.listEntries({ page: 1, pageSize: 3 }),
            symptomApi.getSummary(),
            symptomApi.listSymptoms(),
            symptomApi.listTriggers(),
          ]);

        if (!isMounted) return;
        setRecentEntries(entriesResponse.data.entries);
        setSummary(summaryResponse.data.summary);
        setSymptoms(symptomsResponse.data.symptoms);
        setTriggers(triggersResponse.data.triggers);
      } catch (error) {
        if (!isMounted) return;
        showToast({ tone: 'danger', message: error.message ?? 'Failed to load dashboard' });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    bootstrap();
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await symptomApi.createEntry(payload);
      showToast({ tone: 'success', message: 'Entry logged' });
      await refresh();
      setIsCreateOpen(false);
    } catch (error) {
      showToast({ tone: 'danger', message: error.message ?? 'Failed to save entry' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Medical timeline</p>
          <h1>Clinical narrative overview</h1>
        </div>
        <Button icon={Plus} onClick={() => setIsCreateOpen(true)}>
          New entry
        </Button>
      </header>

      <section className="metrics-grid" aria-label="Timeline metrics">
        <Card>
          <span className="metric__label">Entries this month</span>
          <strong className="metric__value">{summary.entriesThisMonth}</strong>
        </Card>
        <Card>
          <span className="metric__label">Average severity (this month)</span>
          <strong className="metric__value">{summary.averageSeverityThisMonth || '—'}</strong>
        </Card>
        <Card>
          <span className="metric__label">Total entries</span>
          <strong className="metric__value">{summary.totalEntries}</strong>
        </Card>
      </section>

      <section className="content-grid">
        <div className="timeline-list">
          {isLoading ? (
            <Card>
              <Loader />
            </Card>
          ) : recentEntries.length === 0 ? (
            <Card>
              <h2>No entries yet</h2>
              <p>Log your first symptom entry to begin building your clinical narrative.</p>
              <div style={{ marginTop: 16 }}>
                <Button icon={Plus} onClick={() => setIsCreateOpen(true)}>
                  Log first entry
                </Button>
              </div>
            </Card>
          ) : (
            <>
              {recentEntries.map((entry) => (
                <TimelineCard entry={entry} key={entry.publicId} />
              ))}
              <Button onClick={() => navigate(ROUTES.TIMELINE)} variant="secondary">
                View full timeline
              </Button>
            </>
          )}
        </div>
        <Card className="insight-panel">
          <Badge tone="success">Quick log</Badge>
          <h2>Stay consistent</h2>
          <p>
            Logging entries regularly helps surface patterns across symptoms, triggers, and mood
            over time.
          </p>
        </Card>
      </section>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => (isSubmitting ? null : setIsCreateOpen(false))}
        title="Log a new symptom entry"
      >
        <SymptomEntryForm
          isSubmitting={isSubmitting}
          onCancel={() => setIsCreateOpen(false)}
          onSubmit={handleSubmit}
          symptoms={symptoms}
          triggers={triggers}
        />
      </Modal>
    </div>
  );
};
