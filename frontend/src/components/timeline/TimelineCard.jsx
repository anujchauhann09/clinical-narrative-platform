import { Pencil, Trash2 } from 'lucide-react';

import { Badge } from '../common/Badge.jsx';
import { Button } from '../common/Button.jsx';
import { Card } from '../common/Card.jsx';
import { dateService } from '../../services/dateService.js';

const severityTone = (severity) => {
  if (severity >= 7) return 'danger';
  if (severity >= 4) return 'warning';
  return 'success';
};

const severityBorder = (severity) => {
  if (severity >= 7) return 'border-l-danger';
  if (severity >= 4) return 'border-l-warning';
  return 'border-l-success';
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

export const TimelineCard = ({ entry, onDelete, onEdit }) => {
  const symptoms = Array.isArray(entry.symptoms) ? entry.symptoms : [];
  const triggers = Array.isArray(entry.triggers) ? entry.triggers : [];

  return (
    <Card className={`overflow-hidden border-l-4 ${severityBorder(entry.severity)}`} interactive>
      <Card.Pad padding="sm" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <time className="font-medium" dateTime={entry.loggedAt}>
            {dateService.formatDateTime(entry.loggedAt)}
          </time>
          <span aria-hidden="true" className="text-border">·</span>
          <Badge tone={severityTone(entry.severity)}>Severity {entry.severity}/10</Badge>
          {entry.mood ? <Badge>{entry.mood}</Badge> : null}
        </div>

        <h3 className="m-0 text-base font-semibold tracking-tight text-text md:text-[17px]">
          {titleForEntry(entry)}
        </h3>

        {entry.notes ? (
          <p className="m-0 text-sm leading-[1.65] text-muted md:text-[15px]">{entry.notes}</p>
        ) : null}

        {symptoms.length || triggers.length ? (
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map((symptom) => {
              const key = typeof symptom === 'string' ? symptom : symptom.publicId;
              const label = typeof symptom === 'string' ? symptom : symptom.name;
              return (
                <Badge key={`s-${key}`} tone="primary">
                  {label}
                </Badge>
              );
            })}
            {triggers.map((trigger) => {
              const key = typeof trigger === 'string' ? trigger : trigger.publicId;
              const label = typeof trigger === 'string' ? trigger : trigger.name;
              return (
                <Badge key={`t-${key}`} tone="warning">
                  ⚡ {label}
                </Badge>
              );
            })}
          </div>
        ) : null}

        {onEdit || onDelete ? (
          <div className="-mr-2 -mb-1 flex justify-end gap-1">
            {onEdit ? (
              <Button icon={Pencil} onClick={() => onEdit(entry)} size="sm" variant="ghost">
                Edit
              </Button>
            ) : null}
            {onDelete ? (
              <Button icon={Trash2} onClick={() => onDelete(entry)} size="sm" variant="ghost">
                Delete
              </Button>
            ) : null}
          </div>
        ) : null}
      </Card.Pad>
    </Card>
  );
};
