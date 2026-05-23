import { FileText, Repeat, Stethoscope, TrendingUp } from 'lucide-react';

import { NARRATIVE_TYPES, narrativeApi } from '../../api/narrativeApi.js';

// Single source of truth for narrative categories. The page reads from here,
// the tab strip reads from here, the sidebar reads from here. New narrative
// types only need an entry below — no other UI change required.
export const NARRATIVE_TYPE_LIST = [
  {
    key: NARRATIVE_TYPES.SYMPTOM_NARRATIVE,
    label: 'Symptom',
    fullLabel: 'Symptom narrative',
    description:
      'A plain-English medical-style summary of your recent entries, severity, and triggers.',
    icon: FileText,
    tone: 'primary',
    invoke: () => narrativeApi.generateSymptomNarrative(),
  },
  {
    key: NARRATIVE_TYPES.PATTERN_EXPLANATION,
    label: 'Patterns',
    fullLabel: 'Pattern explanation',
    description:
      'Detected correlations turned into short, patient-facing sentences you can act on.',
    icon: Repeat,
    tone: 'success',
    invoke: () => narrativeApi.generatePatternExplanation(),
  },
  {
    key: NARRATIVE_TYPES.DOCTOR_SUMMARY,
    label: 'Doctor visit',
    fullLabel: 'Doctor visit summary',
    description:
      'Structured key symptoms, progression, concerns, and recurring patterns for your next appointment.',
    icon: Stethoscope,
    tone: 'warning',
    invoke: () => narrativeApi.generateDoctorSummary(),
  },
  {
    key: NARRATIVE_TYPES.TIMELINE_NARRATIVE,
    label: 'Timeline',
    fullLabel: 'Timeline narrative',
    description:
      'A chronological story of onset, peaks, plateaus, and recoveries across your log window.',
    icon: TrendingUp,
    tone: 'primary',
    invoke: () => narrativeApi.generateTimelineNarrative(),
  },
];

export const NARRATIVE_TYPES_BY_KEY = Object.fromEntries(
  NARRATIVE_TYPE_LIST.map((entry) => [entry.key, entry]),
);
