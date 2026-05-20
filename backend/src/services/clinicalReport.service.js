import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ApiError } from '../errors/index.js';
import { narrativeRepository } from '../repositories/narrative.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { pdfClient } from '../pdf/pdfClient.js';
import { renderClinicalReportHtml } from '../pdf/templates/clinicalReport.template.js';
import { serializeAiSummary, SUMMARY_TYPES } from '../utils/aiSummarySerializer.js';
import { serializeSymptomEntry } from '../utils/symptomEntrySerializer.js';
import { insightsService } from './insights.service.js';

const DEFAULT_WINDOW_DAYS = 60;
const MAX_TIMELINE_ROWS = 200;

const daysAgo = (days) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date;
};

const round = (value, places = 1) =>
  value === null || value === undefined || Number.isNaN(value) ? null : Number(value.toFixed(places));

const resolveWindow = ({ from, to } = {}) => {
  const resolvedTo = to ? new Date(to) : new Date();
  const resolvedFrom = from ? new Date(from) : daysAgo(DEFAULT_WINDOW_DAYS);
  if (Number.isNaN(resolvedFrom.getTime()) || Number.isNaN(resolvedTo.getTime())) {
    throw new ApiError('Invalid date in `from`/`to`', HTTP_STATUS.BAD_REQUEST);
  }
  if (resolvedFrom > resolvedTo) {
    throw new ApiError('`from` must be earlier than or equal to `to`', HTTP_STATUS.BAD_REQUEST);
  }
  return { from: resolvedFrom, to: resolvedTo };
};

const computeWindowSummary = (entries) => {
  if (!entries.length) {
    return {
      entriesInWindow: 0,
      averageSeverity: null,
      peakSeverity: null,
      distinctSymptoms: 0,
    };
  }
  const severities = entries.map((entry) => entry.severity).filter((value) => Number.isFinite(value));
  const symptomSet = new Set();
  for (const entry of entries) {
    for (const symptom of entry.symptoms ?? []) symptomSet.add(symptom.name);
  }
  return {
    entriesInWindow: entries.length,
    averageSeverity: severities.length
      ? round(severities.reduce((sum, value) => sum + value, 0) / severities.length, 1)
      : null,
    peakSeverity: severities.length ? Math.max(...severities) : null,
    distinctSymptoms: symptomSet.size,
  };
};

const findLatestByType = (summaries, type) =>
  summaries.find((summary) => summary.summaryType === type) ?? null;

export const clinicalReportService = {
  async buildPdf(userPublicId, query = {}) {
    const user = await userRepository.findByPublicId(userPublicId);
    if (!user) {
      throw new ApiError('Patient not found', HTTP_STATUS.NOT_FOUND);
    }

    const window = resolveWindow(query);

    const [rawEntries, insightsData, rawSummaries] = await Promise.all([
      narrativeRepository.listEntriesForWindow({
        userPublicId,
        from: window.from,
        to: window.to,
        limit: MAX_TIMELINE_ROWS,
      }),
      insightsService.getInsights(userPublicId).catch(() => null),
      narrativeRepository.listSummariesForUser({ userPublicId, limit: 40 }),
    ]);

    const entries = rawEntries.map(serializeSymptomEntry);
    const summaries = rawSummaries.map(serializeAiSummary);

    const html = renderClinicalReportHtml({
      patient: {
        publicId: user.publicId,
        email: user.email,
        profile: user.profile,
      },
      window,
      summary: computeWindowSummary(entries),
      entries,
      topSymptoms: insightsData?.ready ? insightsData.topSymptoms ?? [] : [],
      topTriggers: insightsData?.ready ? insightsData.topTriggers ?? [] : [],
      severityTrend: insightsData?.ready ? insightsData.severityTrend ?? null : null,
      narratives: {
        symptom: findLatestByType(summaries, SUMMARY_TYPES.SYMPTOM_NARRATIVE),
        pattern: findLatestByType(summaries, SUMMARY_TYPES.PATTERN_EXPLANATION),
        timeline: findLatestByType(summaries, SUMMARY_TYPES.TIMELINE_NARRATIVE),
        doctor: findLatestByType(summaries, SUMMARY_TYPES.DOCTOR_SUMMARY),
      },
      generatedAt: new Date(),
    });

    const pdfBuffer = await pdfClient.renderHtmlToPdf(html);

    const filenameDate = new Date().toISOString().slice(0, 10);
    return {
      buffer: pdfBuffer,
      filename: `clinical-report-${filenameDate}.pdf`,
    };
  },
};
