import { z } from 'zod';

const emailSchema = z.string().trim().email().max(320).toLowerCase();


const loginPasswordSchema = z.string().min(1).max(128);


const strongPasswordSchema = z
  .string()
  .min(10, 'Password must be at least 10 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/\d/, 'Password must contain a number');

export const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(160),
    email: emailSchema,
    password: strongPasswordSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: loginPasswordSchema,
  }),
});

export const oauthExchangeSchema = z.object({
  body: z.object({
    code: z.string().trim().min(1).max(256),
  }),
});
