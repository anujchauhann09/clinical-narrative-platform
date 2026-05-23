import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

import { cn } from '../../utils/cn.js';

const TONE_ICONS = {
  neutral: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

const TONE_STYLES = {
  neutral: 'border-border bg-surface text-text',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  danger: 'border-danger/30 bg-danger/10 text-danger',
};

export const Toast = ({ children, isOpen = true, tone = 'neutral' }) => {
  const Icon = TONE_ICONS[tone] ?? Info;
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2"
          exit={{ opacity: 0, y: 8 }}
          initial={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={cn(
              'pointer-events-auto flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm shadow-elevated',
              TONE_STYLES[tone] ?? TONE_STYLES.neutral,
            )}
            role="status"
          >
            <Icon aria-hidden="true" size={16} />
            <span>{children}</span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
