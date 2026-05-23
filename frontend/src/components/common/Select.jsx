import { ChevronDown } from 'lucide-react';
import { forwardRef, useId } from 'react';

import { cn } from '../../utils/cn.js';

const baseControl =
  'block w-full appearance-none rounded-xl border border-border bg-surface px-3.5 py-2.5 pr-10 text-sm text-text shadow-soft transition-colors duration-150 ease-smooth focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60';

export const Select = forwardRef(
  (
    {
      children,
      className,
      description,
      error,
      hint,
      id,
      inputClassName,
      label,
      placeholder,
      required,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const inputId = id ?? `select-${reactId}`;
    const errorId = error ? `${inputId}-err` : undefined;
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label ? (
          <label className="text-sm font-medium text-text" htmlFor={inputId}>
            {label}
            {required ? <span aria-hidden="true" className="ml-1 text-danger">*</span> : null}
          </label>
        ) : null}
        {description ? <p className="text-xs text-muted">{description}</p> : null}
        <div className="relative">
          <select
            aria-invalid={Boolean(error) || undefined}
            aria-required={required || undefined}
            className={cn(baseControl, error && 'border-danger focus:ring-danger/30', inputClassName)}
            id={inputId}
            ref={ref}
            {...props}
          >
            {placeholder ? <option value="">{placeholder}</option> : null}
            {children}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
            size={16}
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
Select.displayName = 'Select';
