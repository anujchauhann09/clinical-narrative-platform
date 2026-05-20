import { z } from 'zod';

const severitySchema = z.coerce.number().int().min(1).max(10);
const moodSchema = z.string().trim().max(80).optional().nullable();
const notesSchema = z.string().trim().max(5000).optional().nullable();
const loggedAtSchema = z.string().datetime({ offset: true });
const uuidArraySchema = z.array(z.string().uuid()).max(50);

const uuidParamsSchema = z.object({
  publicId: z.string().uuid(),
});

export const createSymptomEntrySchema = z.object({
  body: z.object({
    severity: severitySchema,
    mood: moodSchema,
    notes: notesSchema,
    loggedAt: loggedAtSchema,
    symptomIds: uuidArraySchema.min(1, 'Select at least one symptom'),
    triggerIds: uuidArraySchema.default([]),
  }),
});

export const updateSymptomEntrySchema = z.object({
  params: uuidParamsSchema,
  body: z
    .object({
      severity: severitySchema.optional(),
      mood: moodSchema,
      notes: notesSchema,
      loggedAt: loggedAtSchema.optional(),
      symptomIds: uuidArraySchema.min(1).optional(),
      triggerIds: uuidArraySchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, 'No updatable fields provided'),
});

export const listSymptomEntriesSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
    from: loggedAtSchema.optional(),
    to: loggedAtSchema.optional(),
  }),
});

export const symptomEntryParamsSchema = z.object({
  params: uuidParamsSchema,
});
