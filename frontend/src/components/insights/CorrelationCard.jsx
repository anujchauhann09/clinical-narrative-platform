import { Badge } from '../common/Badge.jsx';
import { Card } from '../common/Card.jsx';

const toneForConfidence = (confidence) => {
  if (confidence >= 0.75) return 'danger';
  if (confidence >= 0.6) return 'warning';
  return 'primary';
};

export const CorrelationCard = ({ row }) => {
  const percent = Math.round((row.confidence ?? 0) * 100);
  const tone = toneForConfidence(row.confidence ?? 0);

  return (
    <Card>
      <Card.Body className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <p className="m-0 text-sm font-semibold text-text">{row.headline}</p>
          <Badge tone={tone}>{percent}%</Badge>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <span
            className={`block h-full rounded-full bg-primary transition-all duration-300`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="m-0 text-xs text-muted">
          Co-occurred in {row.coOccurrences} of {row.support} relevant entries
        </p>
      </Card.Body>
    </Card>
  );
};
