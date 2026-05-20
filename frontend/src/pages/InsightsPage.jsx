import { ArrowDownRight, ArrowRight, ArrowUpRight, Lightbulb, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { Badge, Button, Card, Loader } from '../components/index.js';
import { ROUTES } from '../constants/app.js';
import { insightApi } from '../api/insightApi.js';
import { useToast } from '../context/ToastContext.jsx';

const TREND_ICON = {
  improving: ArrowDownRight,
  worsening: ArrowUpRight,
  flat: ArrowRight,
  insufficient_data: ArrowRight,
};

const TREND_TONE = {
  improving: 'success',
  worsening: 'danger',
  flat: 'neutral',
  insufficient_data: 'neutral',
};

const formatAverage = (value) => (value === null || value === undefined ? '—' : value.toFixed(1));

const confidenceTone = (confidence) => {
  if (confidence >= 0.75) return 'danger';
  if (confidence >= 0.6) return 'warning';
  return 'neutral';
};

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
        showToast({ tone: 'danger', message: error.message ?? 'Failed to load insights' });
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
      <div className="page">
        <Card>
          <Loader />
        </Card>
      </div>
    );
  }

  if (!insights || !insights.ready) {
    return (
      <div className="page">
        <header className="page-header">
          <div>
            <p className="eyebrow">Patterns</p>
            <h1>Insights</h1>
          </div>
        </header>
        <Card className="insights-empty">
          <div className="insights-empty__icon">
            <Sparkles size={28} />
          </div>
          <h2>Not enough entries yet</h2>
          <p>
            Insights unlock once you've logged at least{' '}
            {insights?.minimumEntriesRequired ?? 3} symptom entries. You have{' '}
            {insights?.totalEntries ?? 0} so far.
          </p>
          <div style={{ marginTop: 16 }}>
            <Button as={Link} icon={Plus} to={ROUTES.TIMELINE}>
              Log a new entry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { correlations, severityTrend, topSymptoms, topTriggers, dayOfWeekPattern } = insights;
  const TrendIcon = TREND_ICON[severityTrend?.direction ?? 'flat'];
  const maxDayCount = Math.max(1, ...dayOfWeekPattern.days.map((d) => d.count));
  const maxSymptomCount = Math.max(1, ...topSymptoms.map((s) => s.count));
  const maxTriggerCount = Math.max(1, ...topTriggers.map((t) => t.count));

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Patterns</p>
          <h1>Insights</h1>
        </div>
      </header>

      <section className="insight-section">
        <header className="insight-section__header">
          <Lightbulb aria-hidden="true" size={18} />
          <h2>Correlations</h2>
        </header>
        {correlations.length === 0 ? (
          <Card>
            <p>
              No strong patterns surfaced yet. Keep logging entries with mixed symptoms and
              triggers to uncover relationships.
            </p>
          </Card>
        ) : (
          <div className="correlation-list">
            {correlations.map((row) => {
              const percent = Math.round(row.confidence * 100);
              return (
                <Card className="correlation-card" key={`${row.symptom.publicId}-${row.trigger.publicId}`}>
                  <div className="correlation-card__row">
                    <p className="correlation-card__headline">{row.headline}</p>
                    <Badge tone={confidenceTone(row.confidence)}>{percent}%</Badge>
                  </div>
                  <div className="correlation-card__bar" aria-hidden="true">
                    <span
                      className={`correlation-card__bar-fill correlation-card__bar-fill--${confidenceTone(row.confidence)}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <p className="correlation-card__meta">
                    Co-occurred in {row.coOccurrences} of {row.support} relevant entries
                  </p>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="insight-section insight-section--grid">
        <Card className="trend-card">
          <header className="insight-section__header">
            <TrendIcon aria-hidden="true" size={18} />
            <h2>Severity trend</h2>
          </header>
          <p className="trend-card__headline">{severityTrend?.headline}</p>
          <div className="trend-card__split">
            <div>
              <span className="metric__label">Last {severityTrend?.windowDays ?? 7} days</span>
              <strong className="metric__value">{formatAverage(severityTrend?.current?.average)}</strong>
              <span className="trend-card__sub">{severityTrend?.current?.count ?? 0} entries</span>
            </div>
            <div>
              <span className="metric__label">Prior period</span>
              <strong className="metric__value">{formatAverage(severityTrend?.prior?.average)}</strong>
              <span className="trend-card__sub">{severityTrend?.prior?.count ?? 0} entries</span>
            </div>
          </div>
          {severityTrend?.deltaAverage !== null && severityTrend?.deltaAverage !== undefined ? (
            <Badge tone={TREND_TONE[severityTrend.direction]}>
              {severityTrend.deltaAverage > 0 ? '+' : ''}
              {severityTrend.deltaAverage} severity ({severityTrend.deltaPercent ?? 0}%)
            </Badge>
          ) : null}
        </Card>

        <Card className="dow-card">
          <header className="insight-section__header">
            <h2>By day of week</h2>
          </header>
          {dayOfWeekPattern.peakDay ? (
            <p className="dow-card__headline">
              You log most often on {dayOfWeekPattern.peakDay.label}s ({dayOfWeekPattern.peakDay.count} entries,
              avg severity {formatAverage(dayOfWeekPattern.peakDay.averageSeverity)})
            </p>
          ) : null}
          <div className="dow-grid">
            {dayOfWeekPattern.days.map((day) => (
              <div className="dow-grid__col" key={day.dayOfWeek}>
                <div className="dow-grid__bar" aria-hidden="true">
                  <span
                    className="dow-grid__bar-fill"
                    style={{ height: `${Math.round((day.count / maxDayCount) * 100)}%` }}
                  />
                </div>
                <span className="dow-grid__label">{day.label.slice(0, 3)}</span>
                <span className="dow-grid__count">{day.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="insight-section insight-section--grid">
        <Card>
          <header className="insight-section__header">
            <h2>Top symptoms</h2>
          </header>
          {topSymptoms.length === 0 ? (
            <p>Not enough repeated symptoms yet.</p>
          ) : (
            <ul className="ranked-list">
              {topSymptoms.map((symptom) => (
                <li className="ranked-list__row" key={symptom.publicId}>
                  <div>
                    <p className="ranked-list__name">{symptom.name}</p>
                    <p className="ranked-list__sub">
                      {symptom.category} · avg severity {formatAverage(symptom.averageSeverity)}
                    </p>
                  </div>
                  <div className="ranked-list__count">
                    <span>{symptom.count}</span>
                    <div className="ranked-list__bar" aria-hidden="true">
                      <span
                        className="ranked-list__bar-fill"
                        style={{ width: `${Math.round((symptom.count / maxSymptomCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <header className="insight-section__header">
            <h2>Top triggers</h2>
          </header>
          {topTriggers.length === 0 ? (
            <p>Not enough repeated triggers yet.</p>
          ) : (
            <ul className="ranked-list">
              {topTriggers.map((trigger) => (
                <li className="ranked-list__row" key={trigger.publicId}>
                  <div>
                    <p className="ranked-list__name">{trigger.name}</p>
                    <p className="ranked-list__sub">
                      avg severity {formatAverage(trigger.averageSeverity)}
                    </p>
                  </div>
                  <div className="ranked-list__count">
                    <span>{trigger.count}</span>
                    <div className="ranked-list__bar" aria-hidden="true">
                      <span
                        className="ranked-list__bar-fill"
                        style={{ width: `${Math.round((trigger.count / maxTriggerCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
};
