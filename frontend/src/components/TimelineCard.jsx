import { dateService } from '../services/dateService.js';
import { Badge } from './Badge.jsx';
import { Card } from './Card.jsx';

export const TimelineCard = ({ entry }) => (
  <Card className="timeline-card">
    <div className="timeline-card__meta">
      <time dateTime={entry.loggedAt}>{dateService.formatDateTime(entry.loggedAt)}</time>
      <Badge tone={entry.severity >= 7 ? 'danger' : 'neutral'}>Severity {entry.severity}</Badge>
    </div>
    <h3>{entry.title}</h3>
    <p>{entry.notes}</p>
    <div className="timeline-card__tags">
      {entry.symptoms.map((symptom) => (
        <Badge key={symptom}>{symptom}</Badge>
      ))}
    </div>
  </Card>
);
