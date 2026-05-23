import { NARRATIVE_TYPES } from '../../api/narrativeApi.js';
import { DoctorSummaryCard } from '../ai/DoctorSummaryCard.jsx';
import { NarrativeProse } from '../ai/NarrativeProse.jsx';

// Doctor summaries arrive as structured content best rendered as a card with
// distinct sections; every other narrative type is freeform prose.
export const NarrativeBody = ({ summary }) => {
  if (summary.summaryType === NARRATIVE_TYPES.DOCTOR_SUMMARY) {
    return <DoctorSummaryCard content={summary.content} />;
  }
  return <NarrativeProse content={summary.content} />;
};
