import { apiClient } from './apiClient.js';

export const NARRATIVE_TYPES = Object.freeze({
  SYMPTOM_NARRATIVE: 'symptom_narrative',
  PATTERN_EXPLANATION: 'pattern_explanation',
  DOCTOR_SUMMARY: 'doctor_summary',
  TIMELINE_NARRATIVE: 'timeline_narrative',
});

const GENERATE_TIMEOUT_MS = 45_000;
const generateConfig = { timeout: GENERATE_TIMEOUT_MS };

export const narrativeApi = {
  generateSymptomNarrative(window = {}) {
    return apiClient.post('/narratives/symptom', window, generateConfig);
  },

  generatePatternExplanation(window = {}) {
    return apiClient.post('/narratives/pattern', window, generateConfig);
  },

  generateDoctorSummary(window = {}) {
    return apiClient.post('/narratives/doctor-summary', window, generateConfig);
  },

  generateTimelineNarrative(window = {}) {
    return apiClient.post('/narratives/timeline', window, generateConfig);
  },

  listSummaries(params = {}) {
    return apiClient.get('/narratives', { params });
  },
};
