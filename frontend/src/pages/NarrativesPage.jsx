import {
  Activity,
  AlertTriangle,
  ClipboardList,
  Clock,
  FileText,
  Repeat,
  Sparkles,
  Stethoscope,
  TrendingUp,
  Wand2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { NARRATIVE_TYPES, narrativeApi } from '../api/narrativeApi.js';
import { Badge, Button, Card, Loader } from '../components/index.js';
import { useToast } from '../context/ToastContext.jsx';
import { parseNarrativeText } from '../utils/narrativeText.js';

const GENERATORS = [
  {
    key: NARRATIVE_TYPES.SYMPTOM_NARRATIVE,
    title: 'Symptom narrative',
    description:
      'Convert your recent entries, severity, and triggers into a plain-English medical-style summary.',
    cta: 'Generate narrative',
    icon: FileText,
    accent: 'primary',
    invoke: () => narrativeApi.generateSymptomNarrative(),
  },
  {
    key: NARRATIVE_TYPES.PATTERN_EXPLANATION,
    title: 'Pattern explanation',
    description:
      'Turn detected correlations into short, patient-facing sentences you can act on.',
    cta: 'Explain patterns',
    icon: Repeat,
    accent: 'success',
    invoke: () => narrativeApi.generatePatternExplanation(),
  },
  {
    key: NARRATIVE_TYPES.DOCTOR_SUMMARY,
    title: 'Doctor visit summary',
    description:
      'Structured key symptoms, progression, concerns, and recurring patterns to bring to your next appointment.',
    cta: 'Build doctor summary',
    icon: Stethoscope,
    accent: 'warning',
    invoke: () => narrativeApi.generateDoctorSummary(),
  },
  {
    key: NARRATIVE_TYPES.TIMELINE_NARRATIVE,
    title: 'Timeline narrative',
    description:
      'A chronological story of onset, peaks, plateaus, and recoveries across your log window.',
    cta: 'Generate timeline',
    icon: TrendingUp,
    accent: 'neutral',
    invoke: () => narrativeApi.generateTimelineNarrative(),
  },
];

const TYPE_META = {
  [NARRATIVE_TYPES.SYMPTOM_NARRATIVE]: { label: 'Symptom narrative', icon: FileText, tone: 'neutral' },
  [NARRATIVE_TYPES.PATTERN_EXPLANATION]: { label: 'Pattern explanation', icon: Repeat, tone: 'success' },
  [NARRATIVE_TYPES.DOCTOR_SUMMARY]: { label: 'Doctor summary', icon: Stethoscope, tone: 'warning' },
  [NARRATIVE_TYPES.TIMELINE_NARRATIVE]: { label: 'Timeline narrative', icon: TrendingUp, tone: 'neutral' },
};

const formatGeneratedAt = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const NarrativeProse = ({ content }) => {
  const blocks = parseNarrativeText(content);
  if (blocks.length === 0) {
    return <p className="narrative-prose__empty">No content was generated.</p>;
  }
  return (
    <div className="narrative-prose">
      {blocks.map((block, index) => {
        if (block.type === 'list') {
          return (
            <ul className="narrative-prose__list" key={`block-${index}`}>
              {block.items.map((item, itemIndex) => (
                <li key={`block-${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p className="narrative-prose__paragraph" key={`block-${index}`}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
};

const DoctorSummaryView = ({ content }) => {
  if (!content || typeof content !== 'object') {
    return <NarrativeProse content={content} />;
  }
  const { keySymptoms = [], progression = '', importantConcerns = [], recurringPatterns = [] } =
    content;

  return (
    <div className="doctor-summary">
      <section className="doctor-summary__section">
        <header className="doctor-summary__heading">
          <ClipboardList aria-hidden="true" size={16} />
          <h3>Key symptoms</h3>
        </header>
        {keySymptoms.length === 0 ? (
          <p className="doctor-summary__empty">No dominant symptoms surfaced.</p>
        ) : (
          <ul className="doctor-summary__list">
            {keySymptoms.map((row, index) => (
              <li key={`${row.name ?? 'symptom'}-${index}`}>
                <strong>{row.name}</strong>
                <span className="doctor-summary__meta">
                  {row.frequency} · severity {row.severityRange}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="doctor-summary__section">
        <header className="doctor-summary__heading">
          <Activity aria-hidden="true" size={16} />
          <h3>Progression</h3>
        </header>
        <p className="doctor-summary__paragraph">{progression || '—'}</p>
      </section>

      <section className="doctor-summary__section">
        <header className="doctor-summary__heading">
          <AlertTriangle aria-hidden="true" size={16} />
          <h3>Important concerns</h3>
        </header>
        {importantConcerns.length === 0 ? (
          <p className="doctor-summary__empty">No concerns flagged.</p>
        ) : (
          <ul className="doctor-summary__bullets">
            {importantConcerns.map((concern, index) => (
              <li key={`concern-${index}`}>{concern}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="doctor-summary__section">
        <header className="doctor-summary__heading">
          <Repeat aria-hidden="true" size={16} />
          <h3>Recurring patterns</h3>
        </header>
        {recurringPatterns.length === 0 ? (
          <p className="doctor-summary__empty">No recurring patterns detected.</p>
        ) : (
          <ul className="doctor-summary__bullets">
            {recurringPatterns.map((pattern, index) => (
              <li key={`pattern-${index}`}>{pattern}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const NarrativeBody = ({ summary }) => {
  if (summary.summaryType === NARRATIVE_TYPES.DOCTOR_SUMMARY) {
    return <DoctorSummaryView content={summary.content} />;
  }

  return <NarrativeProse content={summary.content} />;
};

const GeneratorCard = ({ generator, isGenerating, onGenerate }) => {
  const Icon = generator.icon;
  return (
    <Card className={`generator-card generator-card--${generator.accent}`}>
      <header className="generator-card__header">
        <span className={`generator-card__icon generator-card__icon--${generator.accent}`}>
          <Icon aria-hidden="true" size={18} />
        </span>
        <h3>{generator.title}</h3>
      </header>
      <p className="generator-card__description">{generator.description}</p>
      <div className="generator-card__footer">
        <Button
          icon={Wand2}
          isLoading={isGenerating}
          onClick={() => onGenerate(generator)}
          variant="primary"
        >
          {generator.cta}
        </Button>
      </div>
    </Card>
  );
};

export const NarrativesPage = () => {
  const { showToast } = useToast();
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeGenerator, setActiveGenerator] = useState(null);

  const refresh = useCallback(async () => {
    const response = await narrativeApi.listSummaries({ limit: 20 });
    setSummaries(response.data.summaries);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    narrativeApi
      .listSummaries({ limit: 20 })
      .then((response) => {
        if (!isMounted) return;
        setSummaries(response.data.summaries);
      })
      .catch((error) => {
        if (!isMounted) return;
        showToast({ tone: 'danger', message: error.message ?? 'Failed to load narratives' });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  const handleGenerate = useCallback(
    async (generator) => {
      if (activeGenerator) return;
      setActiveGenerator(generator.key);
      try {
        await generator.invoke();
        showToast({ tone: 'success', message: `${generator.title} ready` });
        await refresh();
      } catch (error) {
        showToast({ tone: 'danger', message: error.message ?? `Failed to generate ${generator.title}` });
      } finally {
        setActiveGenerator(null);
      }
    },
    [activeGenerator, refresh, showToast],
  );

  const latestByType = useMemo(() => {
    const map = new Map();
    for (const summary of summaries) {
      if (!map.has(summary.summaryType)) {
        map.set(summary.summaryType, summary);
      }
    }
    return map;
  }, [summaries]);

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">AI-assisted</p>
          <h1>Narratives</h1>
        </div>
      </header>

      <Card className="narrative-banner">
        <span className="narrative-banner__icon">
          <Sparkles aria-hidden="true" size={20} />
        </span>
        <div>
          <h2>Turn your log into a clinical story</h2>
          <p>
            Narratives are AI-generated from your symptom entries by Gemini. They are not a
            diagnosis and never replace a clinician. Always review before sharing.
          </p>
        </div>
      </Card>

      <section className="insight-section">
        <header className="insight-section__header">
          <Wand2 aria-hidden="true" size={18} />
          <h2>Generate</h2>
        </header>
        <div className="generator-grid">
          {GENERATORS.map((generator) => (
            <GeneratorCard
              generator={generator}
              isGenerating={activeGenerator === generator.key}
              key={generator.key}
              onGenerate={handleGenerate}
            />
          ))}
        </div>
      </section>

      <section className="insight-section">
        <header className="insight-section__header">
          <Clock aria-hidden="true" size={18} />
          <h2>Latest</h2>
        </header>
        {isLoading ? (
          <Card>
            <Loader />
          </Card>
        ) : latestByType.size === 0 ? (
          <Card>
            <p>
              No narratives generated yet. Pick one of the generators above to create your first.
            </p>
          </Card>
        ) : (
          <div className="narrative-list">
            {GENERATORS.map((generator) => {
              const summary = latestByType.get(generator.key);
              if (!summary) return null;
              const meta = TYPE_META[summary.summaryType];
              const Icon = meta?.icon ?? FileText;
              return (
                <Card className="narrative-card" key={summary.publicId}>
                  <header className="narrative-card__header">
                    <div className="narrative-card__title">
                      <Icon aria-hidden="true" size={16} />
                      <h3>{meta?.label ?? summary.summaryType}</h3>
                    </div>
                    <div className="narrative-card__meta">
                      <Badge tone={meta?.tone ?? 'neutral'}>Latest</Badge>
                      <span>{formatGeneratedAt(summary.generatedAt)}</span>
                    </div>
                  </header>
                  <NarrativeBody summary={summary} />
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="insight-section">
        <header className="insight-section__header">
          <FileText aria-hidden="true" size={18} />
          <h2>History</h2>
        </header>
        {isLoading ? null : summaries.length <= latestByType.size ? (
          <Card>
            <p className="narrative-history__empty">
              Older narratives appear here as you generate more.
            </p>
          </Card>
        ) : (
          <div className="narrative-history">
            {summaries.slice(latestByType.size).map((summary) => {
              const meta = TYPE_META[summary.summaryType];
              const Icon = meta?.icon ?? FileText;
              return (
                <Card className="narrative-card narrative-card--compact" key={summary.publicId}>
                  <header className="narrative-card__header">
                    <div className="narrative-card__title">
                      <Icon aria-hidden="true" size={16} />
                      <h3>{meta?.label ?? summary.summaryType}</h3>
                    </div>
                    <span className="narrative-card__timestamp">
                      {formatGeneratedAt(summary.generatedAt)}
                    </span>
                  </header>
                  <NarrativeBody summary={summary} />
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
