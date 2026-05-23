import { cn } from '../../utils/cn.js';

const TONE_FOR = (value) => {
  if (value >= 7) return 'text-danger';
  if (value >= 4) return 'text-warning';
  return 'text-success';
};

export const SeveritySlider = ({ id = 'severity', onChange, value }) => {
  const numericValue = Number(value) || 1;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-text" htmlFor={id}>
          Severity
        </label>
        <span className={cn('text-lg font-semibold tabular-nums', TONE_FOR(numericValue))}>
          {numericValue}
          <span className="ml-0.5 text-xs font-normal text-muted">/10</span>
        </span>
      </div>
      <input
        aria-valuemax={10}
        aria-valuemin={1}
        aria-valuenow={numericValue}
        className={cn(
          'h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-2 outline-none',
          'accent-primary',
        )}
        id={id}
        max={10}
        min={1}
        onChange={(event) => onChange(Number(event.target.value))}
        step={1}
        type="range"
        value={numericValue}
      />
      <div className="flex justify-between text-2xs text-muted">
        <span>Mild</span>
        <span>Moderate</span>
        <span>Severe</span>
      </div>
    </div>
  );
};
