import { z } from 'zod';

const isoDate = z.string().datetime({ offset: true });

export const clinicalReportQuerySchema = z.object({
  query: z
    .object({
      from: isoDate.optional(),
      to: isoDate.optional(),
      tz: z.string().trim().min(1).max(64).optional(),
    })
    .refine((value) => !value.from || !value.to || new Date(value.from) <= new Date(value.to), {
      message: '`from` must be earlier than or equal to `to`',
      path: ['from'],
    }),
});
