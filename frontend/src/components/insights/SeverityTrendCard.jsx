import { ArrowDownRight, ArrowRight, ArrowUpRight } from 'lucide-react';

import { Badge } from '../common/Badge.jsx';
import { Card } from '../common/Card.jsx';

const ICON_FOR = {
  improving: ArrowDownRight,
  worsening: ArrowUpRight,
  flat: ArrowRight,
  insufficient_data: ArrowRight,
};

const TONE_FOR = {
  improving: 'success',
  worsening: 'danger',
  flat: 'neutral',
  insufficient_data: 'neutral',
};

const formatAvg = (value) => (value === null || value === undefined ? '—' : value.toFixed(1));

export const SeverityTrendCard = ({ trend }) => {
  if (!trend) return null;
  const Icon = ICON_FOR[trend.direction] ?? ArrowRight;
  const tone = TONE_FOR[trend.direction] ?? 'neutral';

  return (
    <Card>
      <Card.Header>
        <div className="flex items-center gap-2">
          <Icon aria-hidden="true" size={18} />
          <Card.Title as="h3">Severity trend</Card.Title>
        </div>
        {trend.deltaAverage !== null && trend.deltaAverage !== undefined ? (
          <Badge tone={tone}>
            {trend.deltaAverage > 0 ? '+' : ''}
            {trend.deltaAverage} ({trend.deltaPercent ?? 0}%)
          </Badge>
        ) : null}
      </Card.Header>
      <Card.Body className="flex flex-col gap-4">
        <p className="m-0 text-sm font-medium text-text">{trend.headline}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
            <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-muted">
              Last {trend.windowDays ?? 7} days
            </span>
            <p className="m-0 mt-1 text-2xl font-semibold text-text tabular-nums">
              {formatAvg(trend.current?.average)}
            </p>
            <p className="m-0 text-xs text-muted">{trend.current?.count ?? 0} entries</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 px-3 py-2">
            <span className="text-2xs font-semibold uppercase tracking-[0.12em] text-muted">
              Prior period
            </span>
            <p className="m-0 mt-1 text-2xl font-semibold text-text tabular-nums">
              {formatAvg(trend.prior?.average)}
            </p>
            <p className="m-0 text-xs text-muted">{trend.prior?.count ?? 0} entries</p>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};
