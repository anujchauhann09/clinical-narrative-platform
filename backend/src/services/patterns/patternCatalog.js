export const PATTERN_CATALOG = Object.freeze([
  {
    key: 'migraine_like_cluster',
    title: 'Recurring migraine-like pattern',
    requireAll: [
      ['headache', 'migraine'],
      ['nausea', 'vomit', 'light sensitivity', 'photophobia', 'aura', 'sound sensitivity'],
    ],
    minDistinctEntries: 3,
    windowDays: 30,
    severity: 'noteworthy',
    confidence: 'moderate',
    discussionTopics: ['migraine-type headaches', 'tension-type headaches', 'common headache triggers'],
    observationTemplate:
      'In the last {windowDays} days you logged headache together with {matched} on {n} separate days.',
  },
  {
    key: 'gi_cluster',
    title: 'Recurring digestive symptom pattern',
    requireAll: [
      ['stomach', 'abdominal', 'belly', 'gi', 'gut'],
      ['bloat', 'gas', 'diarrhea', 'diarrhoea', 'constipation', 'nausea', 'reflux', 'heartburn'],
    ],
    minDistinctEntries: 3,
    windowDays: 30,
    severity: 'noteworthy',
    confidence: 'moderate',
    discussionTopics: ['IBS-type symptoms', 'reflux / GERD-type symptoms', 'food sensitivities'],
    observationTemplate:
      'Across {windowDays} days, stomach symptoms appeared with {matched} on {n} separate entries.',
  },
  {
    key: 'respiratory_allergy_cluster',
    title: 'Recurring respiratory / allergy pattern',
    anySymptomKeywords: [
      'sneeze', 'runny nose', 'congestion', 'stuffy', 'itchy eye',
      'wheeze', 'cough', 'shortness of breath',
    ],
    minDistinctEntries: 4,
    windowDays: 30,
    severity: 'informational',
    confidence: 'moderate',
    discussionTopics: ['seasonal allergies', 'allergic rhinitis', 'asthma-type symptoms'],
    observationTemplate:
      'Respiratory symptoms ({matched}) showed up on {n} separate days in the last {windowDays}.',
  },
  {
    key: 'sleep_disruption_cluster',
    title: 'Persistent sleep disruption',
    anySymptomKeywords: ['insomnia', 'trouble sleeping', 'poor sleep', 'cant sleep', 'wake up'],
    minDistinctEntries: 4,
    windowDays: 21,
    severity: 'noteworthy',
    confidence: 'moderate',
    discussionTopics: ['sleep hygiene', 'insomnia patterns', 'circadian / shift-work factors'],
    observationTemplate:
      'Sleep-related symptoms appeared on {n} separate days in the last {windowDays}.',
  },
  {
    key: 'mood_low_cluster',
    title: 'Low-mood / fatigue pattern',
    anySymptomKeywords: ['low mood', 'sad', 'depress', 'fatigue', 'tired', 'no energy', 'anhedonia'],
    minDistinctEntries: 4,
    windowDays: 21,
    severity: 'noteworthy',
    confidence: 'moderate',
    discussionTopics: ['mood changes', 'fatigue causes', 'stress and burnout factors'],
    observationTemplate:
      'You logged low mood or fatigue on {n} separate days over the last {windowDays}.',
  },
]);
