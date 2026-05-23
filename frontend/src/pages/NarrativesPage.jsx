import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Clock,
  FileText,
  Info,
  Repeat,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { NARRATIVE_TYPES, narrativeApi } from '../api/narrativeApi.js';
import { DoctorSummaryCard } from '../components/ai/DoctorSummaryCard.jsx';
import { NarrativeProse } from '../components/ai/NarrativeProse.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { pageFadeRise, staggerContainer, staggerItem } from '../services/motions.js';
import { cn } from '../utils/cn.js';

const TYPES = [
  {
    key: NARRATIVE_TYPES.SYMPTOM_NARRATIVE,
    label: 'Symptom',
    fullLabel: 'Symptom narrative',
    description: 'A plain-English medical-style summary of your recent entries, severity, and triggers.',
    icon: FileText,
    tone: 'primary',
    invoke: () => narrativeApi.generateSymptomNarrative(),
  },
  {
    key: NARRATIVE_TYPES.PATTERN_EXPLANATION,
    label: 'Patterns',
    fullLabel: 'Pattern explanation',
    description: 'Detected correlations turned into short, patient-facing sentences you can act on.',
    icon: Repeat,
    tone: 'success',
    invoke: () => narrativeApi.generatePatternExplanation(),
  },
  {
    key: NARRATIVE_TYPES.DOCTOR_SUMMARY,
    label: 'Doctor visit',
    fullLabel: 'Doctor visit summary',
    description:
      'Structured key symptoms, progression, concerns, and recurring patterns for your next appointment.',
    icon: Stethoscope,
    tone: 'warning',
    invoke: () => narrativeApi.generateDoctorSummary(),
  },
  {
    key: NARRATIVE_TYPES.TIMELINE_NARRATIVE,
    label: 'Timeline',
    fullLabel: 'Timeline narrative',
    description: 'A chronological story of onset, peaks, plateaus, and recoveries across your log window.',
    icon: TrendingUp,
    tone: 'primary',
    invoke: () => narrativeApi.generateTimelineNarrative(),
  },
];

const TYPES_BY_KEY = Object.fromEntries(TYPES.map((entry) => [entry.key, entry]));

const formatGeneratedAt = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const relativeTime = (value) => {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '';
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

const NarrativeBody = ({ summary }) => {
  if (summary.summaryType === NARRATIVE_TYPES.DOCTOR_SUMMARY) {
    return <DoctorSummaryCard content={summary.content} />;
  }
  return <NarrativeProse content={summary.content} />;
};

const TypeSegmented = ({ activeKey, onChange, summariesByType }) => (
  <div
    aria-label="Narrative type"
    className="inline-flex w-full overflow-x-auto rounded-2xl border border-border bg-surface p-1.5 shadow-soft scrollbar-thin"
    role="tablist"
  >
    {TYPES.map((type) => {
      const Icon = type.icon;
      const active = type.key === activeKey;
      const count = summariesByType.get(type.key)?.length ?? 0;
      return (
        <button
          aria-controls={`narrative-panel-${type.key}`}
          aria-selected={active}
          className={cn(
            'group relative inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
            active
              ? 'bg-primary text-primary-contrast shadow-soft'
              : 'text-muted hover:bg-surface-2 hover:text-text',
          )}
          id={`narrative-tab-${type.key}`}
          key={type.key}
          onClick={() => onChange(type.key)}
          role="tab"
          type="button"
        >
          <Icon aria-hidden="true" size={15} strokeWidth={2} />
          <span className="hidden sm:inline">{type.label}</span>
          <span className="sm:hidden">{type.label.split(' ')[0]}</span>
          {count > 0 ? (
            <span
              className={cn(
                'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold',
                active
                  ? 'bg-white/20 text-primary-contrast'
                  : 'bg-primary/10 text-primary-strong',
              )}
            >
              {count}
            </span>
          ) : null}
        </button>
      );
    })}
  </div>
);

const HistoryItem = ({ active = false, onSelect, summary }) => (
  <button
    aria-current={active}
    aria-label={`Open narrative from ${formatGeneratedAt(summary.generatedAt)}`}
    className={cn(
      'w-full rounded-xl border px-3.5 py-3 text-left transition-colors',
      active
        ? 'border-primary/30 bg-primary/10'
        : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-2',
    )}
    onClick={() => onSelect(summary)}
    type="button"
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-text">{formatGeneratedAt(summary.generatedAt)}</span>
      <span className="text-2xs text-muted">{relativeTime(summary.generatedAt)}</span>
    </div>
  </button>
);

export const NarrativesPage = () => {
  const { showToast } = useToast();
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(NARRATIVE_TYPES.SYMPTOM_NARRATIVE);
  const [generatingKey, setGeneratingKey] = useState(null);
  const [selectedByType, setSelectedByType] = useState({});
  const [historyOpen, setHistoryOpen] = useState(false);

  const refresh = useCallback(async () => {
    const response = await narrativeApi.listSummaries({ limit: 40 });
    setSummaries(response.data.summaries);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    narrativeApi
      .listSummaries({ limit: 40 })
      .then((response) => {
        if (!isMounted) return;
        setSummaries(response.data.summaries);
      })
      .catch((error) => {
        if (!isMounted) return;
        showToast({ tone: 'danger', message: error?.message ?? 'Failed to load narratives' });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const summariesByType = useMemo(() => {
    const map = new Map();
    for (const type of TYPES) map.set(type.key, []);
    for (const summary of summaries) {
      const bucket = map.get(summary.summaryType);
      if (bucket) bucket.push(summary);
    }
    return map;
  }, [summaries]);

  const activeType = TYPES_BY_KEY[activeKey];
  const activeBucket = summariesByType.get(activeKey) ?? [];
  const selectedFromState = selectedByType[activeKey];
  const selectedSummary =
    activeBucket.find((summary) => summary.publicId === selectedFromState?.publicId) ??
    activeBucket[0] ??
    null;

  const handleGenerate = useCallback(
    async (type) => {
      if (generatingKey) return;
      setGeneratingKey(type.key);
      try {
        await type.invoke();
        showToast({ tone: 'success', message: `${type.fullLabel} ready` });
        await refresh();
        setSelectedByType((current) => ({ ...current, [type.key]: null }));
      } catch (error) {
        showToast({ tone: 'danger', message: error?.message ?? `Failed to generate ${type.fullLabel}` });
      } finally {
        setGeneratingKey(null);
      }
    },
    [generatingKey, refresh, showToast],
  );

  const handleSelectHistory = (summary) => {
    setSelectedByType((current) => ({ ...current, [activeKey]: summary }));
    setHistoryOpen(false);
  };

  const olderVersions = selectedSummary
    ? activeBucket.filter((summary) => summary.publicId !== selectedSummary.publicId)
    : activeBucket;

  return (
    <Container>
      <motion.div className="flex flex-col gap-5 md:gap-6" {...pageFadeRise}>
        <PageHeader
          description="Pick a narrative type, regenerate when your log changes, or browse older versions in the side panel."
          eyebrow="AI-assisted"
          title="Narratives"
        />

        <Card className="relative overflow-hidden bg-ai-grad text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          />
          <Card.Pad padding="md" className="relative flex items-start gap-3">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-white/15">
              <Sparkles aria-hidden="true" size={18} />
            </span>
            <div className="min-w-0">
              <h2 className="m-0 text-base font-semibold tracking-tight md:text-lg">
                Turn your log into a clinical story
              </h2>
              <p className="m-0 mt-1.5 max-w-2xl text-sm leading-relaxed text-white/90">
                Generated from your symptom entries by Gemini. Not a diagnosis — review before
                sharing with a clinician.
              </p>
            </div>
          </Card.Pad>
        </Card>

        <TypeSegmented
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key);
            setHistoryOpen(false);
          }}
          summariesByType={summariesByType}
        />

        <AnimatePresence mode="wait">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"
            exit={{ opacity: 0, y: -8 }}
            id={`narrative-panel-${activeKey}`}
            initial={{ opacity: 0, y: 8 }}
            key={activeKey}
            role="tabpanel"
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Main content card */}
            <Card>
              <Card.Header>
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                    <activeType.icon aria-hidden="true" size={18} />
                  </span>
                  <div>
                    <Card.Title as="h2" className="text-base md:text-lg">
                      {activeType.fullLabel}
                    </Card.Title>
                    {selectedSummary ? (
                      <Card.Subtitle className="flex items-center gap-1.5">
                        <Clock aria-hidden="true" size={12} />
                        {formatGeneratedAt(selectedSummary.generatedAt)}
                        <span aria-hidden="true" className="text-border">·</span>
                        <span>{relativeTime(selectedSummary.generatedAt)}</span>
                      </Card.Subtitle>
                    ) : (
                      <Card.Subtitle>Not generated yet.</Card.Subtitle>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {selectedSummary && selectedSummary !== activeBucket[0] ? (
                    <Badge tone="neutral">Older version</Badge>
                  ) : selectedSummary ? (
                    <Badge tone={activeType.tone}>Latest</Badge>
                  ) : null}
                  <Button
                    icon={Wand2}
                    isLoading={generatingKey === activeKey}
                    onClick={() => handleGenerate(activeType)}
                    size="sm"
                    variant={selectedSummary ? 'secondary' : 'ai'}
                  >
                    {selectedSummary ? 'Regenerate' : 'Generate'}
                  </Button>
                </div>
              </Card.Header>
              <Card.Body padding="lg">
                {isLoading ? (
                  <Loader />
                ) : selectedSummary ? (
                  <NarrativeBody summary={selectedSummary} />
                ) : (
                  <EmptyState
                    action={
                      <Button
                        icon={Wand2}
                        isLoading={generatingKey === activeKey}
                        onClick={() => handleGenerate(activeType)}
                        variant="ai"
                      >
                        Generate {activeType.label.toLowerCase()}
                      </Button>
                    }
                    description={activeType.description}
                    icon={activeType.icon}
                    title={`No ${activeType.fullLabel.toLowerCase()} yet`}
                  />
                )}
              </Card.Body>
            </Card>

            {/* Side panel: about + history */}
            <aside className="flex flex-col gap-4">
              <Card>
                <Card.Header className="pb-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Info aria-hidden="true" size={16} />
                    <Card.Title as="h3" className="text-sm">
                      About this view
                    </Card.Title>
                  </div>
                </Card.Header>
                <Card.Body className="pt-0">
                  <p className="m-0 text-[13px] leading-relaxed text-muted">
                    {activeType.description}
                  </p>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header className="pb-3">
                  <div className="flex items-center gap-2">
                    <Clock aria-hidden="true" className="text-primary" size={16} />
                    <Card.Title as="h3" className="text-sm">
                      History
                    </Card.Title>
                    <Badge size="sm" tone="neutral">
                      {activeBucket.length}
                    </Badge>
                  </div>
                  {olderVersions.length > 0 ? (
                    <button
                      aria-expanded={historyOpen}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-strong lg:hidden"
                      onClick={() => setHistoryOpen((value) => !value)}
                      type="button"
                    >
                      {historyOpen ? 'Hide' : 'Show'}
                      <ChevronDown
                        className={cn('transition-transform', historyOpen && 'rotate-180')}
                        size={14}
                      />
                    </button>
                  ) : null}
                </Card.Header>
                <Card.Body className="pt-0">
                  {activeBucket.length === 0 ? (
                    <p className="m-0 text-[13px] italic text-muted">
                      No versions yet. Generate one to start the history.
                    </p>
                  ) : (
                    <motion.div
                      animate="animate"
                      className={cn(
                        'flex flex-col gap-2',
                        !historyOpen && 'hidden lg:flex',
                      )}
                      initial="initial"
                      variants={staggerContainer}
                    >
                      {activeBucket.map((summary) => (
                        <motion.div key={summary.publicId} variants={staggerItem}>
                          <HistoryItem
                            active={summary.publicId === selectedSummary?.publicId}
                            onSelect={handleSelectHistory}
                            summary={summary}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </Card.Body>
              </Card>
            </aside>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Container>
  );
};
