import { z } from 'zod';

export const symptomEntrySchema = z.object({
  severity: z.number().int().min(1).max(10),
  mood: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(5000).optional(),
  loggedAt: z.string().datetime(),
  symptomIds: z.array(z.string().uuid()).min(1),
  triggerIds: z.array(z.string().uuid()).default([]),
});
