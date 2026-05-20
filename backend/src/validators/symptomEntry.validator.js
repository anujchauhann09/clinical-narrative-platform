import { z } from 'zod';

const severitySchema = z.coerce.number().int().min(1).max(10);
const moodSchema = z.string().trim().max(80).optional().nullable();
const notesSchema = z.string().trim().max(5000).optional().nullable();
const loggedAtSchema = z.string().datetime({ offset: true });
const uuidArraySchema = z.array(z.string().uuid()).max(50);

const uuidParamsSchema = z.object({
  publicId: z.string().uuid(),
});

const uuidListQuerySchema = z
  .preprocess(
    (value) => {
      if (value === undefined || value === null || value === '') return undefined;
      if (Array.isArray(value)) return value;
      return String(value)
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    },
    z.array(z.string().uuid()).max(50),
  )
  .optional();

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
  query: z
    .object({
      cursor: z.string().min(1).max(200).optional(),
      pageSize: z.coerce.number().int().positive().max(100).default(20),
      sortBy: z.enum(['loggedAt', 'severity', 'createdAt']).default('loggedAt'),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
      from: loggedAtSchema.optional(),
      to: loggedAtSchema.optional(),
      severityMin: severitySchema.optional(),
      severityMax: severitySchema.optional(),
      mood: z.string().trim().min(1).max(80).optional(),
      search: z.string().trim().min(1).max(500).optional(),
      symptomIds: uuidListQuerySchema,
      triggerIds: uuidListQuerySchema,
    })
    .refine(
      (value) =>
        value.severityMin === undefined ||
        value.severityMax === undefined ||
        value.severityMin <= value.severityMax,
      { message: 'severityMin must be less than or equal to severityMax', path: ['severityMin'] },
    )
    .refine(
      (value) =>
        !value.from || !value.to || new Date(value.from) <= new Date(value.to),
      { message: '`from` must be earlier than or equal to `to`', path: ['from'] },
    ),
});

export const symptomEntryParamsSchema = z.object({
  params: uuidParamsSchema,
});
