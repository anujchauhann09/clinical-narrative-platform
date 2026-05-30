import { Sparkles, ThumbsDown, ThumbsUp, X } from 'lucide-react';

import { cn } from '../../utils/cn.js';
import { Badge } from '../common/Badge.jsx';
import { Button } from '../common/Button.jsx';
import { Card } from '../common/Card.jsx';

const SEVERITY_BADGE = {
  informational: { tone: 'neutral', label: 'Informational' },
  noteworthy: { tone: 'warning', label: 'Noteworthy' },
  see_doctor_soon: { tone: 'danger', label: 'Consider a visit' },
};

const CONFIDENCE_LABEL = {
  low: 'Low confidence',
  moderate: 'Moderate confidence',
  strong: 'Strong confidence',
};

export const PatternInsightCard = ({ insight, onDismiss, onFeedback }) => {
  const sev = SEVERITY_BADGE[insight.severity] ?? SEVERITY_BADGE.informational;
  const isUrgent = insight.severity === 'see_doctor_soon';

  return (
    <Card
      className={cn(
        isUrgent && 'border-danger/40 bg-danger/5',
      )}
    >
      <Card.Pad padding="md" className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sparkles aria-hidden="true" size={16} />
            </span>
            <div className="min-w-0">
              <h3 className="m-0 truncate text-sm font-semibold tracking-tight text-text">
                {insight.title}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge tone={sev.tone}>{sev.label}</Badge>
                <span className="text-2xs text-muted">
                  {CONFIDENCE_LABEL[insight.confidence] ?? insight.confidence}
                </span>
              </div>
            </div>
          </div>
          <Button
            aria-label="Hide this insight"
            icon={X}
            onClick={() => onDismiss?.(insight.publicId)}
            size="icon"
            variant="ghost"
          />
        </div>

        <p className="m-0 text-[13px] leading-relaxed text-text">{insight.observation}</p>

        {insight.discussionTopics?.length ? (
          <div className="flex flex-col gap-1">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
              Worth bringing up with your doctor
            </p>
            <ul className="m-0 list-disc pl-4 text-[13px] leading-relaxed text-text">
              {insight.discussionTopics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="m-0 rounded-lg bg-surface-2 px-2.5 py-2 text-[11px] leading-snug text-muted">
          This is a pattern observed in your logs, not a diagnosis. Please discuss with a
          qualified healthcare professional.
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="text-2xs text-muted">
            Based on {insight.evidenceCount} entr{insight.evidenceCount === 1 ? 'y' : 'ies'}
          </span>
          <div className="flex items-center gap-1">
            <Button
              aria-label="Mark helpful"
              icon={ThumbsUp}
              onClick={() => onFeedback?.(insight.publicId, 'helpful')}
              size="icon"
              variant={insight.feedback === 'helpful' ? 'primary' : 'ghost'}
            />
            <Button
              aria-label="Mark not helpful"
              icon={ThumbsDown}
              onClick={() => onFeedback?.(insight.publicId, 'not_helpful')}
              size="icon"
              variant={insight.feedback === 'not_helpful' ? 'danger' : 'ghost'}
            />
          </div>
        </div>
      </Card.Pad>
    </Card>
  );
};
