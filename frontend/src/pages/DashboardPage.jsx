import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Brain,
  CalendarDays,
  FileDown,
  Gauge,
  ListChecks,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { symptomApi } from '../api/symptomApi.js';
import { SeverityTrendChart } from '../components/charts/SeverityTrendChart.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { PatternInsightsSection } from '../components/dashboard/PatternInsightsSection.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { SymptomEntryForm } from '../components/forms/SymptomEntryForm.jsx';
import { TimelineCard } from '../components/timeline/TimelineCard.jsx';
import { ROUTES } from '../constants/app.js';
import { useToast } from '../context/ToastContext.jsx';
import { pageFadeRise, staggerContainer, staggerItem } from '../services/motions.js';

const initialSummary = {
  entriesThisMonth: 0,
  averageSeverityThisMonth: 0,
  totalEntries: 0,
  averageSeverity: 0,
};

const formatSeverity = (value) => (value && value !== 0 ? Number(value).toFixed(1) : '—');

const METRIC_CARDS = (summary) => [
  {
    label: 'Entries this month',
    value: summary.entriesThisMonth,
    icon: CalendarDays,
    accent: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    label: 'Avg severity (month)',
    value: formatSeverity(summary.averageSeverityThisMonth),
    icon: Gauge,
    accent: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    label: 'Total entries',
    value: summary.totalEntries,
    icon: ListChecks,
    accent: 'text-success',
    bg: 'bg-success/10',
  },
  {
    label: 'Avg severity (all-time)',
    value: formatSeverity(summary.averageSeverity),
    icon: Activity,
    accent: 'text-muted',
    bg: 'bg-surface-2',
  },
];

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
      symptomApi.listEntries({ pageSize: 5 }),
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
            symptomApi.listEntries({ pageSize: 5 }),
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
        showToast({ tone: 'danger', message: error?.message ?? 'Failed to load dashboard' });
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
      showToast({ tone: 'danger', message: error?.message ?? 'Failed to save entry' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container>
      <motion.div className="flex flex-col gap-6 md:gap-8" {...pageFadeRise}>
        <PageHeader
          actions={
            <Button icon={Plus} onClick={() => setIsCreateOpen(true)}>
              Log entry
            </Button>
          }
          description="Your latest symptoms, severity trend, and quick access to AI summaries and reports."
          eyebrow="Overview"
          title="Welcome back"
        />

        <motion.div
          animate="animate"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          initial="initial"
          variants={staggerContainer}
        >
          {METRIC_CARDS(summary).map((metric) => {
            const Icon = metric.icon;
            return (
              <motion.div key={metric.label} variants={staggerItem}>
                <Card>
                  <Card.Pad padding="sm" className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${metric.bg} ${metric.accent}`}
                    >
                      <Icon aria-hidden="true" size={18} strokeWidth={2} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                        {metric.label}
                      </p>
                      <p className="m-0 mt-0.5 text-2xl font-semibold tracking-tight text-text tabular-nums">
                        {metric.value}
                      </p>
                    </div>
                  </Card.Pad>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <Card.Header>
              <div className="min-w-0">
                <Card.Title>Severity trend</Card.Title>
                <Card.Subtitle>Across your most recent entries.</Card.Subtitle>
              </div>
            </Card.Header>
            <Card.Body>
              <SeverityTrendChart entries={recentEntries} />
            </Card.Body>
          </Card>

          <Card className="relative overflow-hidden bg-ai-grad text-white">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
            />
            <Card.Pad padding="md" className="relative flex h-full flex-col justify-between gap-5">
              <div className="flex flex-col gap-2.5">
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em]">
                  <Sparkles size={12} /> AI-assisted
                </span>
                <h2 className="m-0 text-lg font-semibold tracking-tight md:text-xl">
                  Turn entries into a clinical narrative
                </h2>
                <p className="m-0 text-sm leading-relaxed text-white/90">
                  Generate a doctor-ready summary from your log in seconds.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  as={Link}
                  className="w-full justify-center bg-white/15 text-white hover:bg-white/25"
                  icon={Brain}
                  to={ROUTES.NARRATIVES}
                  variant="ghost"
                >
                  Open Narratives
                </Button>
                <Button
                  as={Link}
                  className="w-full justify-center bg-white text-primary-strong hover:bg-white/90"
                  icon={FileDown}
                  to={ROUTES.REPORTS}
                  variant="ghost"
                >
                  Download report
                </Button>
              </div>
            </Card.Pad>
          </Card>
        </div>

        <PatternInsightsSection />

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                Recent activity
              </p>
              <h2 className="m-0 mt-1.5 text-lg font-semibold tracking-tight text-text md:text-xl">
                Latest entries
              </h2>
            </div>
            <Button
              as={Link}
              iconRight={ArrowRight}
              onClick={() => navigate(ROUTES.TIMELINE)}
              to={ROUTES.TIMELINE}
              variant="ghost"
              size="sm"
            >
              View timeline
            </Button>
          </div>

          {isLoading ? (
            <Card>
              <Card.Body>
                <Loader />
              </Card.Body>
            </Card>
          ) : recentEntries.length === 0 ? (
            <EmptyState
              action={
                <Button icon={Plus} onClick={() => setIsCreateOpen(true)}>
                  Log first entry
                </Button>
              }
              description="Log your first symptom entry to begin building your clinical narrative."
              icon={Activity}
              title="No entries yet"
            />
          ) : (
            <div className="grid gap-3">
              {recentEntries.map((entry) => (
                <TimelineCard entry={entry} key={entry.publicId} />
              ))}
            </div>
          )}
        </section>
      </motion.div>

      <Modal
        isOpen={isCreateOpen}
        onClose={() => (isSubmitting ? null : setIsCreateOpen(false))}
        size="lg"
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
    </Container>
  );
};
