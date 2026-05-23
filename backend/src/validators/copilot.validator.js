import { z } from 'zod';

const uuid = z.string().uuid();

const messageRoleSchema = z.enum(['user', 'assistant']);

export const chatRequestSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required').max(4000, 'Message is too long'),
    history: z
      .array(
        z.object({
          role: messageRoleSchema,
          content: z.string().min(1).max(4000),
        }),
      )
      .max(20)
      .optional()
      .default([]),
    documentPublicId: uuid.optional(),
  }),
});

export const documentParamsSchema = z.object({
  params: z.object({
    documentPublicId: uuid,
  }),
});
