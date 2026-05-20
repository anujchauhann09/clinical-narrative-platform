import { baseSystemInstruction, renderEntryList, summarizeWindow } from './_shared.js';

const SYSTEM_INSTRUCTION = baseSystemInstruction(
  'Your task is to produce a structured, doctor-visit-ready summary the patient can hand to a ' +
    'clinician. Be concise, factual, and clinically neutral. Do not diagnose or recommend treatment. ' +
    'Return STRICT JSON matching the supplied schema — no prose, no markdown.',
);

export const doctorSummaryResponseSchema = {
  type: 'object',
  properties: {
    keySymptoms: {
      type: 'array',
      description: 'Top symptoms observed in the period, in descending order of importance.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          frequency: {
            type: 'string',
            description: 'Plain-language frequency (e.g., "logged 8 times over 14 days").',
          },
          severityRange: {
            type: 'string',
            description: 'Severity range as a string (e.g., "4-9 / 10").',
          },
        },
        required: ['name', 'frequency', 'severityRange'],
      },
    },
    progression: {
      type: 'string',
      description:
        '2-4 sentences describing how symptoms changed across the period (improving, stable, worsening, episodic).',
    },
    importantConcerns: {
      type: 'array',
      description: 'Notable severity spikes, persistent high-severity symptoms, or red-flag patterns to surface.',
      items: { type: 'string' },
    },
    recurringPatterns: {
      type: 'array',
      description: 'Short patient-facing sentences describing recurring symptom-trigger or temporal patterns.',
      items: { type: 'string' },
    },
  },
  required: ['keySymptoms', 'progression', 'importantConcerns', 'recurringPatterns'],
};

const formatCorrelations = (correlations) => {
  if (!correlations?.length) return '(none)';
  return correlations
    .map((row) => {
      const confidence = row.confidence === null ? 'n/a' : `${Math.round(row.confidence * 100)}%`;
      return `- ${row.symptom?.name} ↔ ${row.trigger?.name} (confidence ${confidence}, co-occurred ${row.coOccurrences}x)`;
    })
    .join('\n');
};

const formatSeverityTrend = (trend) => {
  if (!trend) return '(insufficient data)';
  const current = trend.current?.average ?? 'n/a';
  const prior = trend.prior?.average ?? 'n/a';
  return `direction=${trend.direction}, current avg=${current}, prior avg=${prior}, delta=${trend.deltaAverage ?? 'n/a'}`;
};

export const generateDoctorSummary = ({ entries, correlations = [], severityTrend = null }) => {
  const window = summarizeWindow(entries);
  const renderedEntries = renderEntryList(entries, { limit: 40 });

  const prompt = [
    'Generate a structured doctor-visit summary from the supplied symptom log.',
    '',
    'Hard rules:',
    '- Use ONLY information present in the data. Do not invent symptoms, triggers, dates, or severities.',
    '- Do not diagnose, do not recommend treatment, do not prescribe.',
    '- Keep language neutral and clinical, suitable for a 5-minute primary-care appointment hand-off.',
    '- Return STRICT JSON conforming to the response schema. No prose, no markdown, no code fences.',
    '',
    `Window summary:`,
    `- Entry count: ${window.count}`,
    `- Date range: ${window.from ?? 'n/a'} to ${window.to ?? 'n/a'}`,
    `- Average severity (1-10): ${window.averageSeverity ?? 'n/a'}`,
    `- Severity trend: ${formatSeverityTrend(severityTrend)}`,
    '',
    'Pre-computed correlations (use to populate recurringPatterns):',
    formatCorrelations(correlations),
    '',
    'Raw entries:',
    renderedEntries,
  ].join('\n');

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt,
    generationConfig: { temperature: 0.2, maxOutputTokens: 3000 },
    responseSchema: doctorSummaryResponseSchema,
  };
};
