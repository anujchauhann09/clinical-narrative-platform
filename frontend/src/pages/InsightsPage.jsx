import { motion } from 'framer-motion';
import { Brain, Lightbulb, Plus, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { insightApi } from '../api/insightApi.js';
import { DayOfWeekChart } from '../components/charts/DayOfWeekChart.jsx';
import { TriggerBarChart } from '../components/charts/TriggerBarChart.jsx';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { EmptyState } from '../components/common/EmptyState.jsx';
import { Loader } from '../components/common/Loader.jsx';
import { Container, PageHeader } from '../components/layout/PageHeader.jsx';
import { CorrelationCard } from '../components/insights/CorrelationCard.jsx';
import { SeverityTrendCard } from '../components/insights/SeverityTrendCard.jsx';
import { TopList } from '../components/insights/TopList.jsx';
import { ROUTES } from '../constants/app.js';
import { useToast } from '../context/ToastContext.jsx';
import { pageFadeRise, staggerContainer, staggerItem } from '../services/motions.js';

export const InsightsPage = () => {
  const { showToast } = useToast();
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    insightApi
      .getInsights()
      .then((response) => {
        if (!isMounted) return;
        setInsights(response.data.insights);
      })
      .catch((error) => {
        if (!isMounted) return;
        showToast({ tone: 'danger', message: error?.message ?? 'Failed to load insights' });
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [showToast]);

  if (isLoading) {
    return (
      <Container>
        <Card>
          <Card.Body>
            <Loader />
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (!insights || !insights.ready) {
    return (
      <Container>
        <motion.div className="flex flex-col gap-6" {...pageFadeRise}>
          <PageHeader description="We surface patterns once you have a few entries logged." eyebrow="Patterns" title="Insights" />
          <EmptyState
            action={
              <Button as={Link} icon={Plus} to={ROUTES.TIMELINE}>
                Log a new entry
              </Button>
            }
            description={`Insights unlock once you have logged at least ${insights?.minimumEntriesRequired ?? 3} entries. You have ${insights?.totalEntries ?? 0} so far.`}
            icon={Sparkles}
            title="Not enough entries yet"
          />
        </motion.div>
      </Container>
    );
  }

  const triggerBarData = (insights.topTriggers ?? []).map((trigger) => ({
    name: trigger.name,
    count: trigger.count ?? 0,
  }));

  return (
    <Container>
      <motion.div className="flex flex-col gap-6 md:gap-8" {...pageFadeRise}>
        <PageHeader
          actions={
            <Button as={Link} icon={Brain} to={ROUTES.NARRATIVES} variant="ai">
              Generate AI summary
            </Button>
          }
          description="Co-occurrences, severity trend, and day-of-week patterns computed from your log."
          eyebrow="Patterns"
          title="Insights"
        />

        <section className="flex flex-col gap-3">
          <header className="flex items-center gap-2">
            <Lightbulb aria-hidden="true" className="text-primary" size={16} />
            <h2 className="m-0 text-base font-semibold tracking-tight text-text md:text-lg">
              Correlations
            </h2>
          </header>
          {insights.correlations.length === 0 ? (
            <Card>
              <Card.Pad padding="sm">
                <p className="m-0 text-sm leading-relaxed text-muted md:text-[15px]">
                  No strong patterns surfaced yet. Keep logging entries with mixed symptoms and
                  triggers to uncover relationships.
                </p>
              </Card.Pad>
            </Card>
          ) : (
            <motion.div
              animate="animate"
              className="grid gap-3 md:grid-cols-2"
              initial="initial"
              variants={staggerContainer}
            >
              {insights.correlations.map((row) => (
                <motion.div key={`${row.symptom.publicId}-${row.trigger.publicId}`} variants={staggerItem}>
                  <CorrelationCard row={row} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <SeverityTrendCard trend={insights.severityTrend} />
          <Card>
            <Card.Header>
              <Card.Title as="h3">By day of week</Card.Title>
              {insights.dayOfWeekPattern.peakDay ? (
                <Card.Subtitle>
                  Peak: {insights.dayOfWeekPattern.peakDay.label}s · {insights.dayOfWeekPattern.peakDay.count} entries
                </Card.Subtitle>
              ) : null}
            </Card.Header>
            <Card.Body>
              <DayOfWeekChart days={insights.dayOfWeekPattern.days} />
            </Card.Body>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <TopList
            emptyLabel="Not enough repeated symptoms yet."
            items={insights.topSymptoms}
            subtitleFor={(item) =>
              `${item.category} · avg severity ${item.averageSeverity?.toFixed(1) ?? '—'}`
            }
            title="Top symptoms"
          />
          <TopList
            emptyLabel="Not enough repeated triggers yet."
            items={insights.topTriggers}
            subtitleFor={(item) => `avg severity ${item.averageSeverity?.toFixed(1) ?? '—'}`}
            title="Top triggers"
          />
        </section>

        {triggerBarData.length ? (
          <Card>
            <Card.Header>
              <Card.Title as="h3">Trigger frequency</Card.Title>
              <Card.Subtitle>Ranked by entries where each trigger appeared.</Card.Subtitle>
            </Card.Header>
            <Card.Body>
              <TriggerBarChart data={triggerBarData} />
            </Card.Body>
          </Card>
        ) : null}
      </motion.div>
    </Container>
  );
};
