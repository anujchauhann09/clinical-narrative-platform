const SAFETY_DISCLAIMER =
  'You are an AI clinical writing assistant for a patient-facing symptom tracking app. ' +
  'You are NOT a medical professional and you must never diagnose, prescribe, recommend treatment, ' +
  'or replace a clinician. Use neutral, descriptive language. Refer to the person as "the patient" ' +
  'or "you" consistent with the requested output. If the data is sparse or ambiguous, say so plainly ' +
  'rather than inventing details. Never fabricate symptoms, dates, severities, or triggers that are ' +
  'not present in the supplied data.';

const PLAIN_TEXT_FORMAT_RULES =
  'OUTPUT FORMAT (strict): Plain prose ONLY. Do NOT use any markdown syntax. ' +
  'Forbidden characters and patterns: asterisks (* or **), underscores for emphasis, backticks, ' +
  'hash signs (#) as headings, leading dashes/bullets, numbered lists, blockquotes (>), ' +
  'code fences, HTML tags, or section labels like "Summary:". ' +
  'Write complete sentences only. Separate paragraphs with a single blank line if more than one is needed.';

export const plainTextSystemInstruction = (extra = '') =>
  [SAFETY_DISCLAIMER, PLAIN_TEXT_FORMAT_RULES, extra].filter(Boolean).join('\n\n');

export const baseSystemInstruction = (extra = '') =>
  [SAFETY_DISCLAIMER, extra].filter(Boolean).join('\n\n');

const truncate = (value, max) => {
  if (!value) return null;
  const str = String(value).trim();
  if (!str) return null;
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
};

const isoDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export const formatEntryForPrompt = (entry) => ({
  loggedAt: isoDate(entry.loggedAt),
  severity: entry.severity,
  mood: truncate(entry.mood, 80),
  notes: truncate(entry.notes, 280),
  symptoms: (entry.symptoms ?? []).map((symptom) => symptom.name),
  triggers: (entry.triggers ?? []).map((trigger) => trigger.name),
});

export const renderEntryList = (entries, { limit = 30 } = {}) => {
  if (!entries?.length) return '(no entries)';
  const sliced = entries.slice(0, limit);
  return sliced
    .map((entry, index) => {
      const formatted = formatEntryForPrompt(entry);
      const symptoms = formatted.symptoms.length ? formatted.symptoms.join(', ') : 'none recorded';
      const triggers = formatted.triggers.length ? formatted.triggers.join(', ') : 'none recorded';
      const mood = formatted.mood ?? 'unspecified';
      const notes = formatted.notes ?? '—';
      return [
        `Entry ${index + 1}:`,
        `  Logged at: ${formatted.loggedAt}`,
        `  Severity (1-10): ${formatted.severity}`,
        `  Mood: ${mood}`,
        `  Symptoms: ${symptoms}`,
        `  Triggers: ${triggers}`,
        `  Notes: ${notes}`,
      ].join('\n');
    })
    .join('\n\n');
};

export const summarizeWindow = (entries) => {
  if (!entries?.length) return { count: 0, from: null, to: null, averageSeverity: null };
  const severities = entries.map((entry) => entry.severity).filter((value) => Number.isFinite(value));
  const sorted = [...entries].sort(
    (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime(),
  );
  return {
    count: entries.length,
    from: isoDate(sorted[0].loggedAt),
    to: isoDate(sorted[sorted.length - 1].loggedAt),
    averageSeverity: severities.length
      ? Number((severities.reduce((sum, value) => sum + value, 0) / severities.length).toFixed(2))
      : null,
  };
};
