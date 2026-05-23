import { motion } from 'framer-motion';
import { ChevronDown, Clock, Info } from 'lucide-react';
import { useState } from 'react';

import { dateService } from '../../services/dateService.js';
import { staggerContainer, staggerItem } from '../../services/motions.js';
import { cn } from '../../utils/cn.js';
import { Badge } from '../common/Badge.jsx';
import { Card } from '../common/Card.jsx';

const HistoryItem = ({ active = false, onSelect, summary }) => (
  <button
    aria-current={active}
    aria-label={`Open narrative from ${dateService.formatDateTime(summary.generatedAt)}`}
    className={cn(
      'w-full rounded-xl border px-3.5 py-3 text-left transition-colors',
      active
        ? 'border-primary/30 bg-primary/10'
        : 'border-border bg-surface hover:border-primary/30 hover:bg-surface-2',
    )}
    onClick={() => onSelect(summary)}
    type="button"
  >
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-text">
        {dateService.formatDateTime(summary.generatedAt)}
      </span>
      <span className="text-2xs text-muted">{dateService.formatRelative(summary.generatedAt)}</span>
    </div>
  </button>
);

export const NarrativeHistory = ({
  activeType,
  bucket,
  selectedSummary,
  onSelect,
}) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const olderVersions = selectedSummary
    ? bucket.filter((summary) => summary.publicId !== selectedSummary.publicId)
    : bucket;

  return (
    <aside className="flex flex-col gap-4">
      <Card>
        <Card.Header className="pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Info aria-hidden="true" size={16} />
            <Card.Title as="h3" className="text-sm">
              About this view
            </Card.Title>
          </div>
        </Card.Header>
        <Card.Body className="pt-0">
          <p className="m-0 text-[13px] leading-relaxed text-muted">{activeType.description}</p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="pb-3">
          <div className="flex items-center gap-2">
            <Clock aria-hidden="true" className="text-primary" size={16} />
            <Card.Title as="h3" className="text-sm">
              History
            </Card.Title>
            <Badge size="sm" tone="neutral">
              {bucket.length}
            </Badge>
          </div>
          {olderVersions.length > 0 ? (
            <button
              aria-expanded={historyOpen}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-strong lg:hidden"
              onClick={() => setHistoryOpen((value) => !value)}
              type="button"
            >
              {historyOpen ? 'Hide' : 'Show'}
              <ChevronDown
                className={cn('transition-transform', historyOpen && 'rotate-180')}
                size={14}
              />
            </button>
          ) : null}
        </Card.Header>
        <Card.Body className="pt-0">
          {bucket.length === 0 ? (
            <p className="m-0 text-[13px] italic text-muted">
              No versions yet. Generate one to start the history.
            </p>
          ) : (
            <motion.div
              animate="animate"
              className={cn('flex flex-col gap-2', !historyOpen && 'hidden lg:flex')}
              initial="initial"
              variants={staggerContainer}
            >
              {bucket.map((summary) => (
                <motion.div key={summary.publicId} variants={staggerItem}>
                  <HistoryItem
                    active={summary.publicId === selectedSummary?.publicId}
                    onSelect={onSelect}
                    summary={summary}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </Card.Body>
      </Card>
    </aside>
  );
};
