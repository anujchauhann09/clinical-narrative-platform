import { forwardRef, useId } from 'react';

import { cn } from '../../utils/cn.js';

const baseControl =
  'block w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-muted/70 shadow-soft transition-colors duration-150 ease-smooth focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60';

export const Input = forwardRef(
  (
    {
      className,
      description,
      error,
      hint,
      icon: Icon,
      id,
      label,
      required,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const inputId = id ?? `input-${reactId}`;
    const descriptionId = description ? `${inputId}-desc` : undefined;
    const errorId = error ? `${inputId}-err` : undefined;
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label ? (
          <label className="text-sm font-medium text-text" htmlFor={inputId}>
            {label}
            {required ? <span aria-hidden="true" className="ml-1 text-danger">*</span> : null}
          </label>
        ) : null}
        {description ? (
          <p className="text-xs text-muted" id={descriptionId}>
            {description}
          </p>
        ) : null}
        <div className="relative">
          {Icon ? (
            <Icon
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={16}
            />
          ) : null}
          <input
            aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
            aria-invalid={Boolean(error) || undefined}
            aria-required={required || undefined}
            className={cn(baseControl, Icon ? 'pl-10' : '', error && 'border-danger focus:ring-danger/30')}
            id={inputId}
            ref={ref}
            type={type}
            {...props}
          />
        </div>
        {error ? (
          <p className="text-xs font-medium text-danger" id={errorId} role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';

export const Textarea = forwardRef(
  (
    {
      className,
      description,
      error,
      hint,
      id,
      label,
      required,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const inputId = id ?? `textarea-${reactId}`;
    const descriptionId = description ? `${inputId}-desc` : undefined;
    const errorId = error ? `${inputId}-err` : undefined;
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label ? (
          <label className="text-sm font-medium text-text" htmlFor={inputId}>
            {label}
            {required ? <span aria-hidden="true" className="ml-1 text-danger">*</span> : null}
          </label>
        ) : null}
        {description ? (
          <p className="text-xs text-muted" id={descriptionId}>
            {description}
          </p>
        ) : null}
        <textarea
          aria-describedby={[descriptionId, errorId].filter(Boolean).join(' ') || undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-required={required || undefined}
          className={cn(baseControl, 'min-h-[96px] resize-y', error && 'border-danger focus:ring-danger/30')}
          id={inputId}
          ref={ref}
          rows={rows}
          {...props}
        />
        {error ? (
          <p className="text-xs font-medium text-danger" id={errorId} role="alert">
            {error}
          </p>
        ) : hint ? (
          <p className="text-xs text-muted">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
