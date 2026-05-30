import { PATTERN_CATALOG } from './patternCatalog.js';

const MIN_TOTAL_ENTRIES = 10;
const MIN_DAYS_SPAN = 14;

const lower = (value) => String(value ?? '').toLowerCase();

const entrySymptomNames = (entry) =>
  (entry.symptoms ?? [])
    .map((row) => lower(row.symptom?.name))
    .filter(Boolean);

const entryMatchesAnyKeyword = (entry, keywords) => {
  if (!keywords?.length) return null;
  const names = entrySymptomNames(entry);
  for (const keyword of keywords) {
    const hit = names.find((name) => name.includes(keyword));
    if (hit) return hit;
  }
  return null;
};

const entryMatchesAllGroups = (entry, groups) => {
  if (!groups?.length) return null;
  const matched = [];
  for (const group of groups) {
    const hit = entryMatchesAnyKeyword(entry, group);
    if (!hit) return null;
    matched.push(hit);
  }
  return matched;
};

const evaluateRule = (rule, entries) => {
  const matchingEntries = [];
  const matchedTerms = new Set();

  for (const entry of entries) {
    let matched = null;
    if (rule.requireAll) {
      matched = entryMatchesAllGroups(entry, rule.requireAll);
    } else if (rule.anySymptomKeywords) {
      const hit = entryMatchesAnyKeyword(entry, rule.anySymptomKeywords);
      matched = hit ? [hit] : null;
    }

    if (matched) {
      matchingEntries.push(entry);
      for (const term of matched) matchedTerms.add(term);
    }
  }

  if (matchingEntries.length < rule.minDistinctEntries) return null;

  const sortedDates = matchingEntries
    .map((e) => new Date(e.loggedAt))
    .sort((a, b) => a - b);
  const windowStart = sortedDates[0];
  const windowEnd = sortedDates[sortedDates.length - 1];

  const matchedList = Array.from(matchedTerms).slice(0, 5).join(', ');
  const observation = rule.observationTemplate
    .replace('{windowDays}', String(rule.windowDays))
    .replace('{n}', String(matchingEntries.length))
    .replace('{matched}', matchedList || 'related symptoms');

  return {
    patternKey: rule.key,
    title: rule.title,
    observation,
    discussionTopics: rule.discussionTopics,
    severity: rule.severity,
    confidence: rule.confidence,
    evidenceCount: matchingEntries.length,
    windowStart,
    windowEnd,
  };
};

const eligibilityVerdict = (entries) => {
  if (entries.length < MIN_TOTAL_ENTRIES) {
    return { eligible: false, reason: 'insufficient_entries' };
  }
  const dates = entries.map((e) => new Date(e.loggedAt).getTime());
  const span = (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24);
  if (span < MIN_DAYS_SPAN) {
    return { eligible: false, reason: 'insufficient_span' };
  }
  return { eligible: true };
};

export const patternDetector = {
  MIN_TOTAL_ENTRIES,
  MIN_DAYS_SPAN,

  detect(entries) {
    const safeEntries = Array.isArray(entries) ? entries : [];
    const verdict = eligibilityVerdict(safeEntries);
    if (!verdict.eligible) {
      return { eligible: false, reason: verdict.reason, patterns: [] };
    }

    const now = Date.now();
    const patterns = [];

    for (const rule of PATTERN_CATALOG) {
      const cutoff = now - rule.windowDays * 24 * 60 * 60 * 1000;
      const windowed = safeEntries.filter((e) => new Date(e.loggedAt).getTime() >= cutoff);
      const result = evaluateRule(rule, windowed);
      if (result) patterns.push(result);
    }

    return { eligible: true, patterns };
  },
};
