import { plainTextSystemInstruction, renderEntryList, summarizeWindow } from './_shared.js';

const SYSTEM_INSTRUCTION = plainTextSystemInstruction(
  'Your task is to narrate a chronological timeline of the patient\'s symptom log. ' +
    'Describe how things evolved over the window — onset, peaks, plateaus, recoveries — ' +
    'using only the data provided. Keep it readable and human, not list-like.',
);

export const generateTimelineNarrative = ({ entries }) => {
  const window = summarizeWindow(entries);
  const renderedEntries = renderEntryList(entries, { limit: 40 });

  const prompt = [
    'Write a chronological narrative of how the patient\'s symptoms evolved over the period below.',
    '',
    'Requirements:',
    '- Narrate the timeline in chronological order (earliest first).',
    '- Call out clear transitions: onset, escalations, severity peaks, plateaus, and recoveries.',
    '- Mention triggers and mood ONLY where they coincide meaningfully with symptom changes.',
    '- 6-10 sentences. Plain prose paragraph(s). No bullet lists, no markdown, no headings.',
    '- Use neutral medical-style language. Do not diagnose or recommend treatment.',
    '- Do not invent dates, severities, symptoms, or triggers.',
    '',
    `Window summary:`,
    `- Entry count: ${window.count}`,
    `- Date range: ${window.from ?? 'n/a'} to ${window.to ?? 'n/a'}`,
    `- Average severity (1-10): ${window.averageSeverity ?? 'n/a'}`,
    '',
    'Raw entries (chronological order may vary — sort by Logged at when narrating):',
    renderedEntries,
  ].join('\n');

  return {
    systemInstruction: SYSTEM_INSTRUCTION,
    prompt,
    generationConfig: { temperature: 0.4, maxOutputTokens: 2000 },
  };
};
