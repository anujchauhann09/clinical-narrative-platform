import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { backdropFade, modalPop } from '../../services/motions.js';
import { cn } from '../../utils/cn.js';
import { Button } from './Button.jsx';

const SIZE_MAP = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const Modal = ({
  children,
  className,
  description,
  footer,
  isOpen,
  onClose,
  size = 'md',
  title,
}) => {
  const dialogRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocusedRef.current = document.activeElement;

    // Move focus into the modal on open so keyboard users land somewhere sensible.
    // Defer to next tick so the framer-motion entrance doesn't fight us.
    const focusTimer = window.setTimeout(() => {
      const node = dialogRef.current;
      if (!node) return;
      const first = node.querySelector(FOCUSABLE_SELECTOR);
      (first ?? node).focus({ preventScroll: true });
    }, 0);

    const handler = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }
      // Tab-cycle inside the modal so Shift+Tab from first / Tab from last
      // wraps around instead of escaping to the page behind it.
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = prevOverflow;
      // Return focus to whatever opened the modal so the user's tab order is preserved.
      const previous = previouslyFocusedRef.current;
      if (previous && typeof previous.focus === 'function') {
        previous.focus({ preventScroll: true });
      }
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          aria-hidden={!isOpen}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          {...backdropFade}
        >
          <button
            aria-label="Close"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            tabIndex={-1}
            type="button"
          />
          <motion.section
            aria-modal="true"
            className={cn(
              'relative flex max-h-[90vh] w-full flex-col rounded-2xl border border-border bg-surface text-text shadow-elevated focus:outline-none',
              SIZE_MAP[size] ?? SIZE_MAP.md,
              className,
            )}
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
            {...modalPop}
          >
            {title || onClose ? (
              <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 pb-4 pt-5 md:px-6 md:pt-6">
                <div className="min-w-0">
                  {title ? (
                    <h2 className="m-0 text-base font-semibold tracking-tight text-text md:text-lg">
                      {title}
                    </h2>
                  ) : null}
                  {description ? (
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
                  ) : null}
                </div>
                {onClose ? (
                  <Button
                    aria-label="Close modal"
                    icon={X}
                    onClick={onClose}
                    size="icon"
                    variant="ghost"
                  />
                ) : null}
              </header>
            ) : null}
            <div className="flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6 scrollbar-thin">
              {children}
            </div>
            {footer ? (
              <footer className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5 md:px-6 md:py-4">
                {footer}
              </footer>
            ) : null}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};
