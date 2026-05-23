import { AnimatePresence, motion } from 'framer-motion';
import { Clock, Sparkles, Wand2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { NARRATIVE_TYPES, narrativeApi } from '../api/narrativeApi.js';
import { Badge } from '../components/common/Badge.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { NarrativeBody } from '../components/narratives/NarrativeBody.jsx';
import { NarrativeHistory } from '../components/narratives/NarrativeHistory.jsx';
import { NarrativeTypeTabs } from '../components/narratives/NarrativeTypeTabs.jsx';
import {
  NARRATIVE_TYPE_LIST,
  NARRATIVE_TYPES_BY_KEY,
} from '../components/narratives/narrativeTypes.js';
import { useToast } from '../context/ToastContext.jsx';
import { dateService } from '../services/dateService.js';
import { pageFadeRise } from '../services/motions.js';

export const NarrativesPage = () => {
  const { showToast } = useToast();
  const [summaries, setSummaries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(NARRATIVE_TYPES.SYMPTOM_NARRATIVE);
  const [generatingKey, setGeneratingKey] = useState(null);
  const [selectedByType, setSelectedByType] = useState({});

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
    for (const type of NARRATIVE_TYPE_LIST) map.set(type.key, []);
    for (const summary of summaries) {
      const bucket = map.get(summary.summaryType);
      if (bucket) bucket.push(summary);
    }
    return map;
  }, [summaries]);

  const activeType = NARRATIVE_TYPES_BY_KEY[activeKey];
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
        showToast({
          tone: 'danger',
          message: error?.message ?? `Failed to generate ${type.fullLabel}`,
        });
      } finally {
        setGeneratingKey(null);
      }
    },
    [generatingKey, refresh, showToast],
  );

  const handleSelectHistory = (summary) => {
    setSelectedByType((current) => ({ ...current, [activeKey]: summary }));
  };

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

        <NarrativeTypeTabs
          activeKey={activeKey}
          onChange={setActiveKey}
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
                        {dateService.formatDateTime(selectedSummary.generatedAt)}
                        <span aria-hidden="true" className="text-border">·</span>
                        <span>{dateService.formatRelative(selectedSummary.generatedAt)}</span>
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

            <NarrativeHistory
              activeType={activeType}
              bucket={activeBucket}
              onSelect={handleSelectHistory}
              selectedSummary={selectedSummary}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Container>
  );
};
