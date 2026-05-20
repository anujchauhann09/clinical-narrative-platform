import { z } from 'zod';

import { SUMMARY_TYPES } from '../utils/aiSummarySerializer.js';

const isoDate = z.string().datetime({ offset: true });

const windowSchema = z
  .object({
    from: isoDate.optional(),
    to: isoDate.optional(),
  })
  .refine((value) => !value.from || !value.to || new Date(value.from) <= new Date(value.to), {
    message: '`from` must be earlier than or equal to `to`',
    path: ['from'],
  });

export const generateNarrativeSchema = z.object({
  body: windowSchema.default({}),
});

export const listSummariesSchema = z.object({
  query: z.object({
    summaryType: z.enum(Object.values(SUMMARY_TYPES)).optional(),
    limit: z.coerce.number().int().positive().max(50).default(10),
  }),
});
