import { z } from 'zod';

export const symptomEntrySchema = z.object({
  severity: z.coerce.number().int().min(1, 'Severity must be at least 1').max(10),
  mood: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((value) => (value ? value : undefined)),
  notes: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((value) => (value ? value : undefined)),
  loggedAt: z
    .string()
    .min(1, 'Date and time are required')
    .refine(
      (value) => new Date(value).getTime() <= Date.now() + 60_000,
      'The date and time cannot be in the future',
    ),
  symptomIds: z.array(z.string().uuid()).min(1, 'Select at least one symptom'),
  triggerIds: z.array(z.string().uuid()).default([]),
});
