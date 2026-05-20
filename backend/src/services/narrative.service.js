import { geminiClient } from '../ai/geminiClient.js';
import {
  generateDoctorSummary as buildDoctorSummaryPrompt,
  generatePatternExplanation as buildPatternExplanationPrompt,
  generateSymptomNarrative as buildSymptomNarrativePrompt,
  generateTimelineNarrative as buildTimelineNarrativePrompt,
} from '../ai/promptTemplates/index.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { narrativeRepository } from '../repositories/narrative.repository.js';
import { serializeSymptomEntry } from '../utils/symptomEntrySerializer.js';
import { SUMMARY_TYPES, serializeAiSummary } from '../utils/aiSummarySerializer.js';
import { insightsService } from './insights.service.js';

const MIN_ENTRIES_FOR_NARRATIVE = 3;
const DEFAULT_WINDOW_DAYS = 30;
const DOCTOR_SUMMARY_WINDOW_DAYS = 60;

const daysAgo = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

const resolveWindow = ({ from, to, defaultDays }) => {
  const resolvedTo = to ? new Date(to) : new Date();
  const resolvedFrom = from ? new Date(from) : daysAgo(defaultDays);

  if (resolvedFrom > resolvedTo) {
    throw new ApiError('`from` must be earlier than or equal to `to`', HTTP_STATUS.BAD_REQUEST);
  }

  return { from: resolvedFrom, to: resolvedTo };
};

const loadEntries = async ({ userPublicId, from, to, defaultDays, limit }) => {
  const window = resolveWindow({ from, to, defaultDays });
  const rawEntries = await narrativeRepository.listEntriesForWindow({
    userPublicId,
    from: window.from,
    to: window.to,
    limit,
  });
  const entries = rawEntries.map(serializeSymptomEntry);

  if (entries.length < MIN_ENTRIES_FOR_NARRATIVE) {
    throw new ApiError(
      `Not enough entries to generate narrative (need ${MIN_ENTRIES_FOR_NARRATIVE}, found ${entries.length} in window)`,
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
    );
  }

  return { entries, window };
};

const persistAndSerialize = async ({ userPublicId, summaryType, content }) => {
  const stored = typeof content === 'string' ? content : JSON.stringify(content);
  const saved = await narrativeRepository.saveSummary({
    userPublicId,
    summaryType,
    content: stored,
  });
  return serializeAiSummary(saved);
};

export const narrativeService = {
  async generateSymptomNarrative(userPublicId, { from, to } = {}) {
    const { entries, window } = await loadEntries({
      userPublicId,
      from,
      to,
      defaultDays: DEFAULT_WINDOW_DAYS,
      limit: 60,
    });

    const promptPayload = buildSymptomNarrativePrompt({ entries });
    const narrative = await geminiClient.generate(promptPayload);

    const summary = await persistAndSerialize({
      userPublicId,
      summaryType: SUMMARY_TYPES.SYMPTOM_NARRATIVE,
      content: narrative,
    });

    return {
      summary,
      window: { from: window.from, to: window.to, entryCount: entries.length },
    };
  },

  async generatePatternExplanation(userPublicId, { from, to } = {}) {
    const { entries, window } = await loadEntries({
      userPublicId,
      from,
      to,
      defaultDays: DEFAULT_WINDOW_DAYS,
      limit: 60,
    });

    const insights = await insightsService.getInsights(userPublicId);
    if (!insights.ready || insights.correlations.length === 0) {
      throw new ApiError(
        'Not enough correlated entries yet to explain a pattern. Keep logging and try again.',
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
      );
    }

    const promptPayload = buildPatternExplanationPrompt({
      correlations: insights.correlations,
      entries,
    });
    const explanation = await geminiClient.generate(promptPayload);

    const summary = await persistAndSerialize({
      userPublicId,
      summaryType: SUMMARY_TYPES.PATTERN_EXPLANATION,
      content: explanation,
    });

    return {
      summary,
      window: { from: window.from, to: window.to, entryCount: entries.length },
      correlationCount: insights.correlations.length,
    };
  },

  async generateDoctorSummary(userPublicId, { from, to } = {}) {
    const { entries, window } = await loadEntries({
      userPublicId,
      from,
      to,
      defaultDays: DOCTOR_SUMMARY_WINDOW_DAYS,
      limit: 80,
    });

    const insights = await insightsService.getInsights(userPublicId);
    const promptPayload = buildDoctorSummaryPrompt({
      entries,
      correlations: insights.ready ? insights.correlations : [],
      severityTrend: insights.ready ? insights.severityTrend : null,
    });

    const structured = await geminiClient.generateJson(promptPayload);

    const summary = await persistAndSerialize({
      userPublicId,
      summaryType: SUMMARY_TYPES.DOCTOR_SUMMARY,
      content: structured,
    });

    return {
      summary,
      window: { from: window.from, to: window.to, entryCount: entries.length },
    };
  },

  async generateTimelineNarrative(userPublicId, { from, to } = {}) {
    const { entries, window } = await loadEntries({
      userPublicId,
      from,
      to,
      defaultDays: DEFAULT_WINDOW_DAYS,
      limit: 60,
    });

    const promptPayload = buildTimelineNarrativePrompt({ entries });
    const narrative = await geminiClient.generate(promptPayload);

    const summary = await persistAndSerialize({
      userPublicId,
      summaryType: SUMMARY_TYPES.TIMELINE_NARRATIVE,
      content: narrative,
    });

    return {
      summary,
      window: { from: window.from, to: window.to, entryCount: entries.length },
    };
  },

  async listSummaries(userPublicId, { summaryType, limit } = {}) {
    const rows = await narrativeRepository.listSummariesForUser({
      userPublicId,
      summaryType,
      limit,
    });
    return rows.map(serializeAiSummary);
  },
};
