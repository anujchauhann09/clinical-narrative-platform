import { z } from 'zod';

const emailSchema = z.string().trim().email('Enter a valid email address').max(320).toLowerCase();
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters').max(128);

export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
