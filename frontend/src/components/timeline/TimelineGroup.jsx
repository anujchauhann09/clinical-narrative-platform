import { motion } from 'framer-motion';

import { dateService } from '../../services/dateService.js';
import { staggerContainer, staggerItem } from '../../services/motions.js';
import { TimelineCard } from './TimelineCard.jsx';

export const TimelineGroup = ({ dateKey, entries, onDelete, onEdit }) => (
  <section aria-label={dateService.formatGroupHeader(entries[0].loggedAt)} className="flex flex-col gap-4">
    <header className="sticky top-14 z-10 -mx-2 flex items-center justify-between gap-3 rounded-xl bg-bg/85 px-3 py-2.5 backdrop-blur">
      <h2 className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        {dateService.formatGroupHeader(entries[0].loggedAt)}
      </h2>
      <span className="text-xs text-muted">
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
      </span>
    </header>
    <motion.div
      animate="animate"
      className="grid gap-4"
      initial="initial"
      variants={staggerContainer}
    >
      {entries.map((entry) => (
        <motion.div key={entry.publicId} variants={staggerItem}>
          <TimelineCard entry={entry} onDelete={onDelete} onEdit={onEdit} />
        </motion.div>
      ))}
    </motion.div>
  </section>
);
