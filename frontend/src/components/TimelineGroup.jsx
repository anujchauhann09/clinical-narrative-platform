import { dateService } from '../services/dateService.js';
import { TimelineCard } from './TimelineCard.jsx';

export const TimelineGroup = ({ dateKey, entries, onEdit, onDelete }) => (
  <section aria-label={dateService.formatGroupHeader(entries[0].loggedAt)} className="timeline-group">
    <header className="timeline-group__header">
      <h2 className="timeline-group__title">
        {dateService.formatGroupHeader(entries[0].loggedAt)}
      </h2>
      <span className="timeline-group__count">
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
      </span>
    </header>
    <div className="timeline-group__list">
      {entries.map((entry) => (
        <TimelineCard
          entry={entry}
          key={entry.publicId}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  </section>
);
