export const SUMMARY_TYPES = Object.freeze({
  SYMPTOM_NARRATIVE: 'symptom_narrative',
  PATTERN_EXPLANATION: 'pattern_explanation',
  DOCTOR_SUMMARY: 'doctor_summary',
  TIMELINE_NARRATIVE: 'timeline_narrative',
});

const STRUCTURED_TYPES = new Set([SUMMARY_TYPES.DOCTOR_SUMMARY]);

export const isStructuredSummary = (summaryType) => STRUCTURED_TYPES.has(summaryType);

export const serializeAiSummary = (summary) => {
  const isStructured = isStructuredSummary(summary.summaryType);
  let content = summary.content;

  if (isStructured && typeof summary.content === 'string') {
    try {
      content = JSON.parse(summary.content);
    } catch {
      content = summary.content;
    }
  }

  return {
    publicId: summary.publicId,
    summaryType: summary.summaryType,
    content,
    generatedAt: summary.generatedAt,
  };
};
