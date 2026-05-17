import { z } from 'zod';

const emailSchema = z.string().trim().email().max(320).toLowerCase();
const passwordSchema = z.string().min(8).max(128);

export const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(160),
    email: emailSchema,
    password: passwordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
});
