export const serializeSymptom = (symptom) => ({
  publicId: symptom.publicId,
  name: symptom.name,
  category: symptom.category,
});

export const serializeTrigger = (trigger) => ({
  publicId: trigger.publicId,
  name: trigger.name,
});

export const serializeSymptomEntry = (entry) => ({
  publicId: entry.publicId,
  severity: entry.severity,
  mood: entry.mood,
  notes: entry.notes,
  loggedAt: entry.loggedAt,
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
  symptoms: (entry.symptoms ?? []).map((link) => serializeSymptom(link.symptom)),
  triggers: (entry.triggers ?? []).map((link) => serializeTrigger(link.trigger)),
});
