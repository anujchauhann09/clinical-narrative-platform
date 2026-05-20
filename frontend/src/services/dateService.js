const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
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

export const dateService = {
  formatDateTime(value) {
    return dateTimeFormatter.format(new Date(value));
  },

  formatTime(value) {
    return timeFormatter.format(new Date(value));
  },

  localDateKey(value) {
    const date = new Date(value);
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
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
};
