import { plainTextSystemInstruction, renderEntryList, summarizeWindow } from './_shared.js';

const SYSTEM_INSTRUCTION = plainTextSystemInstruction(
  'Your task is to explain co-occurrence patterns the patient has been logging. ' +
    'Frame each pattern in a single short, plain-English sentence the patient can act on. ' +
    'Patterns must be grounded in the supplied correlation evidence — do not invent links.',
);

const formatCorrelations = (correlations) => {
  if (!correlations?.length) return '(no statistically supported correlations available)';
  return correlations
    .map((row, index) => {
      const confidencePercent = row.confidence === null ? 'n/a' : Math.round(row.confidence * 100);
      const direction =
        row.direction === 'trigger_predicts_symptom'
          ? `${row.trigger?.name} → ${row.symptom?.name}`
          : `${row.symptom?.name} ↔ ${row.trigger?.name}`;
      return [
        `Pattern ${index + 1}: ${direction}`,
        `  Co-occurrences: ${row.coOccurrences}`,
        `  Confidence: ${confidencePercent}%`,
        `  Headline (raw): ${row.headline ?? '—'}`,
      ].join('\n');
    })
    .join('\n\n');
};

export const generatePatternExplanation = ({ correlations, entries = [] }) => {
  const window = summarizeWindow(entries);
  const formattedCorrelations = formatCorrelations(correlations);
  const sampleEntries = entries.length ? renderEntryList(entries, { limit: 10 }) : '(not provided)';

  const prompt = [
    'Write a brief, patient-facing pattern explanation based on the correlations below.',
    '',
    'Requirements:',
    '- Produce 2-5 short sentences, each describing one distinct pattern.',
    '- Use language like "Your fatigue episodes frequently occur after poor sleep and high stress periods."',
    '- Use the second person ("you", "your").',
    '- Only describe patterns that appear in the correlation data. Do not invent links.',
    '- Do not give medical advice or recommend treatment.',
    '- Output plain text only. No bullets, no markdown, no headings.',
    '',
    `Window summary:`,
    `- Entry count: ${window.count}`,
    `- Date range: ${window.from ?? 'n/a'} to ${window.to ?? 'n/a'}`,
    `- Average severity (1-10): ${window.averageSeverity ?? 'n/a'}`,
    '',
    'Correlations:',
    formattedCorrelations,
    '',
    'Sample recent entries (for context only — do not enumerate them in the output):',
    sampleEntries,
  ].join('\n');

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt,
    generationConfig: { temperature: 0.4, maxOutputTokens: 1200 },
  };
};
