import { Clock } from 'lucide-react';

import { Badge } from '../common/Badge.jsx';
import { Card } from '../common/Card.jsx';
import { cn } from '../../utils/cn.js';
import { DoctorSummaryCard } from './DoctorSummaryCard.jsx';
import { NarrativeProse } from './NarrativeProse.jsx';

const formatGeneratedAt = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

export const NarrativeCard = ({ compact = false, icon: Icon, label, summary, tone = 'primary' }) => {
  if (!summary) return null;
  const isDoctor = summary.summaryType === 'doctor_summary';

  return (
    <Card className={cn(compact && 'bg-surface-2')}>
      <Card.Header>
        <div className="flex items-center gap-2">
          {Icon ? (
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon aria-hidden="true" size={14} />
            </span>
          ) : null}
          <div>
            <Card.Title as="h3">{label}</Card.Title>
            <Card.Subtitle className="flex items-center gap-1 text-xs">
              <Clock aria-hidden="true" size={12} />
              {formatGeneratedAt(summary.generatedAt)}
            </Card.Subtitle>
          </div>
        </div>
        {!compact ? <Badge tone={tone}>Latest</Badge> : null}
      </Card.Header>
      <Card.Body>
        {isDoctor ? (
          <DoctorSummaryCard content={summary.content} />
        ) : (
          <NarrativeProse content={summary.content} />
        )}
      </Card.Body>
    </Card>
  );
};
