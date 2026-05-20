import { plainTextSystemInstruction, renderEntryList, summarizeWindow } from './_shared.js';

const SYSTEM_INSTRUCTION = plainTextSystemInstruction(
  'Your task is to convert raw symptom log entries into a single, cohesive medical-style narrative ' +
    'summary, written in plain English at a literacy level a non-clinician can follow. ' +
    'Stick to facts present in the data. Length: 4-7 sentences in ONE paragraph.',
);

export const generateSymptomNarrative = ({ entries }) => {
  const window = summarizeWindow(entries);
  const renderedEntries = renderEntryList(entries, { limit: 30 });

  const prompt = [
    'Generate a medical narrative summary from the patient-reported symptom log below.',
    '',
    'Requirements:',
    '- Describe overall symptom burden, dominant symptoms, and severity range observed.',
    '- Mention triggers and mood patterns ONLY if they appear repeatedly in the data.',
    '- Use neutral, descriptive medical-style language (e.g., "the patient reported", "episodes of").',
    '- Do not diagnose, recommend treatment, or speculate beyond what is logged.',
    '- Do not invent symptoms, dates, severities, or triggers.',
    '- Output a single paragraph of 4-7 sentences. No headings, no bullet lists, no markdown.',
    '',
    `Window summary:`,
    `- Entry count: ${window.count}`,
    `- Date range: ${window.from ?? 'n/a'} to ${window.to ?? 'n/a'}`,
    `- Average severity (1-10): ${window.averageSeverity ?? 'n/a'}`,
    '',
    'Raw entries:',
    renderedEntries,
  ].join('\n');

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt,
    generationConfig: { temperature: 0.3, maxOutputTokens: 1500 },
  };
};
