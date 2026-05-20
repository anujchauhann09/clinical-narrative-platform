import { insightsRepository } from '../repositories/insights.repository.js';

const MIN_ENTRIES_FOR_INSIGHTS = 3;
const MIN_CORRELATION_CONFIDENCE = 0.5;

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const round = (value, places = 2) =>
  value === null || value === undefined ? null : Number(value.toFixed(places));

const percentInt = (value) =>
  value === null || value === undefined ? null : Math.round(value * 100);

const orientCorrelation = (row) => {
  const triggerLeads = (row.symptomGivenTrigger ?? 0) >= (row.triggerGivenSymptom ?? 0);

  if (triggerLeads) {
    return {
      direction: 'trigger_predicts_symptom',
      headline: `${row.symptom.name} appears in ${percentInt(row.symptomGivenTrigger)}% of entries with ${row.trigger.name}`,
      confidence: round(row.symptomGivenTrigger, 4),
      symptom: row.symptom,
      trigger: row.trigger,
      coOccurrences: row.coOccurrences,
      support: row.triggerTotal,
    };
  }

  return {
    direction: 'symptom_predicts_trigger',
    headline: `${row.trigger.name} was logged with ${percentInt(row.triggerGivenSymptom)}% of ${row.symptom.name} entries`,
    confidence: round(row.triggerGivenSymptom, 4),
    symptom: row.symptom,
    trigger: row.trigger,
    coOccurrences: row.coOccurrences,
    support: row.symptomTotal,
  };
};

const buildSeverityTrend = (trend) => {
  const currentAvg = trend.current.average;
  const priorAvg = trend.prior.average;

  if (currentAvg === null || priorAvg === null) {
    return {
      ...trend,
      current: { ...trend.current, average: round(trend.current.average, 2) },
      prior: { ...trend.prior, average: round(trend.prior.average, 2) },
      deltaAverage: null,
      deltaPercent: null,
      direction: 'insufficient_data',
      headline:
        currentAvg === null
          ? 'Not enough entries this week for a severity trend yet.'
          : 'Log entries last week to compare against this week.',
    };
  }

  const deltaAverage = currentAvg - priorAvg;
  const deltaPercent = priorAvg === 0 ? null : (deltaAverage / priorAvg) * 100;

  let direction = 'flat';
  if (deltaAverage <= -0.5) direction = 'improving';
  else if (deltaAverage >= 0.5) direction = 'worsening';

  const headlineByDirection = {
    improving: `Average severity dropped ${Math.abs(round(deltaAverage, 1))} points vs the prior week.`,
    worsening: `Average severity rose ${Math.abs(round(deltaAverage, 1))} points vs the prior week.`,
    flat: 'Severity is holding steady compared to last week.',
  };

  return {
    windowDays: trend.windowDays,
    current: { ...trend.current, average: round(currentAvg, 2) },
    prior: { ...trend.prior, average: round(priorAvg, 2) },
    deltaAverage: round(deltaAverage, 2),
    deltaPercent: round(deltaPercent, 1),
    direction,
    headline: headlineByDirection[direction],
  };
};

const buildDayOfWeekPattern = (rows) => {
  const filled = Array.from({ length: 7 }, (_, idx) => ({
    dayOfWeek: idx,
    label: DAY_LABELS[idx],
    count: 0,
    averageSeverity: null,
  }));

  for (const row of rows) {
    if (row.dayOfWeek === null) continue;
    filled[row.dayOfWeek] = {
      dayOfWeek: row.dayOfWeek,
      label: DAY_LABELS[row.dayOfWeek],
      count: row.count ?? 0,
      averageSeverity: round(row.averageSeverity, 1),
    };
  }

  let peakDay = null;
  for (const row of filled) {
    if (row.count > 0 && (peakDay === null || row.count > peakDay.count)) {
      peakDay = row;
    }
  }

  return { days: filled, peakDay };
};

export const insightsService = {
  async getInsights(userPublicId) {
    const totalEntries = await insightsRepository.totalEntries(userPublicId);

    if (totalEntries < MIN_ENTRIES_FOR_INSIGHTS) {
      return {
        totalEntries,
        ready: false,
        minimumEntriesRequired: MIN_ENTRIES_FOR_INSIGHTS,
        correlations: [],
        severityTrend: null,
        topSymptoms: [],
        topTriggers: [],
        dayOfWeekPattern: { days: [], peakDay: null },
      };
    }

    const [rawCorrelations, severityTrendRaw, topSymptoms, topTriggers, dayOfWeekRows] =
      await Promise.all([
        insightsRepository.correlations(userPublicId),
        insightsRepository.severityTrend(userPublicId),
        insightsRepository.topSymptoms(userPublicId),
        insightsRepository.topTriggers(userPublicId),
        insightsRepository.dayOfWeekPattern(userPublicId),
      ]);

    const correlations = rawCorrelations
      .map(orientCorrelation)
      .filter((row) => row.confidence !== null && row.confidence >= MIN_CORRELATION_CONFIDENCE);

    return {
      totalEntries,
      ready: true,
      correlations,
      severityTrend: buildSeverityTrend(severityTrendRaw),
      topSymptoms: topSymptoms.map((row) => ({
        ...row,
        averageSeverity: round(row.averageSeverity, 1),
      })),
      topTriggers: topTriggers.map((row) => ({
        ...row,
        averageSeverity: round(row.averageSeverity, 1),
      })),
      dayOfWeekPattern: buildDayOfWeekPattern(dayOfWeekRows),
    };
  },
};
