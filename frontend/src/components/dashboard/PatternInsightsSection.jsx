import { Sparkles } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { patternInsightApi } from '../../api/patternInsightApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Card } from '../common/Card.jsx';
import { PatternInsightCard } from './PatternInsightCard.jsx';

const MAX_VISIBLE = 3;

export const PatternInsightsSection = () => {
  const { showToast } = useToast();
  const [insights, setInsights] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await patternInsightApi.list();
      setInsights(response.data?.insights ?? null);
    } catch (error) {
      setInsights({ ready: false, patterns: [] });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDismiss = useCallback(
    async (publicId) => {
      setInsights((prev) =>
        prev
          ? { ...prev, patterns: prev.patterns.filter((p) => p.publicId !== publicId) }
          : prev,
      );
      try {
        await patternInsightApi.dismiss(publicId);
      } catch (error) {
        showToast({ tone: 'danger', message: 'Could not hide insight' });
        load();
      }
    },
    [load, showToast],
  );

  const handleFeedback = useCallback(
    async (publicId, feedback) => {
      setInsights((prev) =>
        prev
          ? {
              ...prev,
              patterns: prev.patterns.map((p) =>
                p.publicId === publicId ? { ...p, feedback } : p,
              ),
            }
          : prev,
      );
      try {
        await patternInsightApi.submitFeedback(publicId, feedback);
      } catch (error) {
        showToast({ tone: 'danger', message: 'Could not save feedback' });
      }
    },
    [showToast],
  );

  if (!insights) return null;
  const patterns = insights.patterns ?? [];

  if (!insights.ready && patterns.length === 0) {
    return null;
  }

  const visible = expanded ? patterns : patterns.slice(0, MAX_VISIBLE);
  const hidden = patterns.length - visible.length;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            <Sparkles aria-hidden="true" size={12} /> Patterns we noticed
          </p>
          <h2 className="m-0 mt-1.5 text-lg font-semibold tracking-tight text-text md:text-xl">
            Things worth discussing with your doctor
          </h2>
        </div>
      </div>

      {patterns.length === 0 ? (
        <Card>
          <Card.Pad padding="md">
            <p className="m-0 text-sm text-muted">
              Keep logging — once there's enough data, we'll surface patterns here. These are
              observations, never diagnoses.
            </p>
          </Card.Pad>
        </Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((insight) => (
            <PatternInsightCard
              insight={insight}
              key={insight.publicId}
              onDismiss={handleDismiss}
              onFeedback={handleFeedback}
            />
          ))}
          {hidden > 0 ? (
            <button
              className="self-start text-xs font-semibold text-primary hover:text-primary-strong"
              onClick={() => setExpanded(true)}
              type="button"
            >
              Show {hidden} more
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
};
