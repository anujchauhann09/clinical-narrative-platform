import { Pencil, Trash2 } from 'lucide-react';

import { dateService } from '../services/dateService.js';
import { Badge } from './Badge.jsx';
import { Button } from './Button.jsx';
import { Card } from './Card.jsx';

const severityTone = (severity) => {
  if (severity >= 7) return 'danger';
  if (severity >= 4) return 'neutral';
  return 'success';
};

const titleForEntry = (entry) => {
  if (entry.title) return entry.title;
  const symptomList = Array.isArray(entry.symptoms) ? entry.symptoms : [];
  if (symptomList.length === 0) return 'Symptom entry';
  const names = symptomList.map((symptom) =>
    typeof symptom === 'string' ? symptom : symptom.name,
  );
  if (names.length <= 2) return names.join(' + ');
  return `${names.slice(0, 2).join(' + ')} +${names.length - 2}`;
};

export const TimelineCard = ({ entry, onEdit, onDelete }) => {
  const symptomList = Array.isArray(entry.symptoms) ? entry.symptoms : [];
  const triggerList = Array.isArray(entry.triggers) ? entry.triggers : [];

  return (
    <Card className="timeline-card">
      <div className="timeline-card__meta">
        <time dateTime={entry.loggedAt}>{dateService.formatDateTime(entry.loggedAt)}</time>
        <Badge tone={severityTone(entry.severity)}>Severity {entry.severity}</Badge>
        {entry.mood ? <Badge>Mood: {entry.mood}</Badge> : null}
      </div>
      <h3>{titleForEntry(entry)}</h3>
      {entry.notes ? <p>{entry.notes}</p> : null}
      {symptomList.length > 0 ? (
        <div className="timeline-card__tags">
          {symptomList.map((symptom) => {
            const key = typeof symptom === 'string' ? symptom : symptom.publicId;
            const label = typeof symptom === 'string' ? symptom : symptom.name;
            return <Badge key={key}>{label}</Badge>;
          })}
        </div>
      ) : null}
      {triggerList.length > 0 ? (
        <div className="timeline-card__tags">
          {triggerList.map((trigger) => {
            const key = typeof trigger === 'string' ? trigger : trigger.publicId;
            const label = typeof trigger === 'string' ? trigger : trigger.name;
            return (
              <Badge key={key} tone="warning">
                Trigger: {label}
              </Badge>
            );
          })}
        </div>
      ) : null}
      {onEdit || onDelete ? (
        <div className="timeline-card__actions">
          {onEdit ? (
            <Button icon={Pencil} onClick={() => onEdit(entry)} variant="secondary">
              Edit
            </Button>
          ) : null}
          {onDelete ? (
            <Button icon={Trash2} onClick={() => onDelete(entry)} variant="ghost">
              Delete
            </Button>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
};
