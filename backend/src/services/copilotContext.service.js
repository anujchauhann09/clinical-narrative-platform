import { narrativeRepository } from '../repositories/narrative.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import { serializeSymptomEntry } from '../utils/symptomEntrySerializer.js';

const RECENT_ENTRY_LIMIT = 10;
const RECENT_SUMMARY_LIMIT = 3;

const formatDate = (value) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? '').slice(0, 10);

const formatEntry = (entry) => {
  const symptoms = entry.symptoms?.map((s) => s.name).join(', ') || 'none recorded';
  const triggers = entry.triggers?.map((t) => t.name).join(', ') || 'none recorded';
  const mood = entry.mood ? `mood ${entry.mood}` : 'mood not recorded';
  const notes = entry.notes ? ` Notes: ${entry.notes}` : '';
  return `• ${formatDate(entry.loggedAt)} — severity ${entry.severity}/10, ${mood}; symptoms: ${symptoms}; triggers: ${triggers}.${notes}`;
};

const formatSummary = (summary) => {
  const generated = summary.generatedAt instanceof Date
    ? summary.generatedAt.toISOString()
    : summary.generatedAt;
  return `• [${summary.summaryType} — ${generated}] ${summary.content}`;
};

export const copilotContextService = {
  async buildUserContext(userPublicId) {
    const [profile, rawEntries, summaries] = await Promise.all([
      userRepository.findProfileSummaryByUserPublicId(userPublicId),
      narrativeRepository.listEntriesForWindow({ userPublicId, limit: RECENT_ENTRY_LIMIT }),
      narrativeRepository.listSummariesForUser({ userPublicId, limit: RECENT_SUMMARY_LIMIT }),
    ]);

    const entries = rawEntries.map(serializeSymptomEntry);
    const lines = [];

    if (profile?.name) {
      const demographics = [];
      if (profile.dateOfBirth) demographics.push(`DOB ${profile.dateOfBirth.toISOString().slice(0, 10)}`);
      if (profile.sex) demographics.push(`sex ${profile.sex}`);
      lines.push(`Patient: ${profile.name}${demographics.length ? ` (${demographics.join(', ')})` : ''}.`);
    }

    lines.push('', `Recent symptom entries (most recent first, max ${RECENT_ENTRY_LIMIT}):`);
    if (entries.length) {
      entries.forEach((entry) => lines.push(formatEntry(entry)));
    } else {
      lines.push('(none — this user has not logged any symptom entries yet)');
    }

    lines.push('', `Recent AI-generated summaries (max ${RECENT_SUMMARY_LIMIT}):`);
    if (summaries.length) {
      summaries.forEach((summary) => lines.push(formatSummary(summary)));
    } else {
      lines.push('(none — no AI summaries have been generated for this user)');
    }

    return {
      hasData: entries.length > 0 || summaries.length > 0,
      text: lines.join('\n'),
    };
  },
};
