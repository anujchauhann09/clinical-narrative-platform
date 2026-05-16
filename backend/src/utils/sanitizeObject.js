const sanitizeString = (value) =>
  value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();

const sanitizeKey = (key) => key.replace(/^\$+/, '').replace(/\./g, '_');

export const sanitizeObject = (value) => {
  if (typeof value === 'string') return sanitizeString(value);
  if (Array.isArray(value)) return value.map((item) => sanitizeObject(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        sanitizeKey(key),
        sanitizeObject(nestedValue),
      ]),
    );
  }

  return value;
};
