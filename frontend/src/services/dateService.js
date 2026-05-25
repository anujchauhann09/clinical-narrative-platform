const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const dateOnlyFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const longDateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
});

const pad = (value) => String(value).padStart(2, '0');

const isSameLocalDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const yyyyMmDdFromDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const RELATIVE_THRESHOLDS = [
  { limit: 60, divisor: 1, unit: 'second' },
  { limit: 3600, divisor: 60, unit: 'minute' },
  { limit: 86_400, divisor: 3600, unit: 'hour' },
  { limit: 604_800, divisor: 86_400, unit: 'day' },
  { limit: 2_592_000, divisor: 604_800, unit: 'week' },
  { limit: 31_536_000, divisor: 2_592_000, unit: 'month' },
];
const relativeFormatter = new Intl.RelativeTimeFormat('en-US', { numeric: 'auto' });

export const dateService = {
  formatDateTime(value) {
    return value ? dateTimeFormatter.format(new Date(value)) : '—';
  },

  formatDate(value) {
    return value ? dateOnlyFormatter.format(new Date(value)) : '—';
  },

  formatTime(value) {
    return value ? timeFormatter.format(new Date(value)) : '—';
  },

  localDateKey(value) {
    return yyyyMmDdFromDate(new Date(value));
  },

  formatGroupHeader(value) {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (isSameLocalDay(date, today)) return 'Today';
    if (isSameLocalDay(date, yesterday)) return 'Yesterday';
    return longDateFormatter.format(date);
  },


  todayYyyyMmDd() {
    return yyyyMmDdFromDate(new Date());
  },

  daysAgoYyyyMmDd(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return yyyyMmDdFromDate(date);
  },

  nowDatetimeLocal() {
    const now = new Date();
    return `${yyyyMmDdFromDate(now)}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  },

  toIsoStartOfDay(yyyyMmDd) {
    if (!yyyyMmDd) return undefined;
    const date = new Date(`${yyyyMmDd}T00:00:00`);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  },

  toIsoEndOfDay(yyyyMmDd) {
    if (!yyyyMmDd) return undefined;
    const date = new Date(`${yyyyMmDd}T23:59:59.999`);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  },

  formatRelative(value) {
    if (!value) return '—';
    const target = new Date(value);
    if (Number.isNaN(target.getTime())) return '—';
    const diffSeconds = (target.getTime() - Date.now()) / 1000;
    const absSeconds = Math.abs(diffSeconds);
    for (const { limit, divisor, unit } of RELATIVE_THRESHOLDS) {
      if (absSeconds < limit) {
        return relativeFormatter.format(Math.round(diffSeconds / divisor), unit);
      }
    }
    return relativeFormatter.format(Math.round(diffSeconds / 31_536_000), 'year');
  },
};
