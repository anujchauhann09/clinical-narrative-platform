import { z } from 'zod';

const nameSchema = z.string().trim().min(1).max(160);
const bioSchema = z.string().trim().max(2000).nullable();
const dateOfBirthSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be in YYYY-MM-DD format')
  .refine(
    (value) => {
      const date = new Date(value);
      return !Number.isNaN(date.getTime()) && date <= new Date();
    },
    { message: 'Date of birth must be a valid past date' },
  )
  .nullable();
const sexSchema = z.string().trim().max(40).nullable();
const phoneSchema = z
  .string()
  .trim()
  .max(32)
  .regex(/^[+\d][\d\s\-().]*$/, 'Phone must contain only digits, spaces, or + - ( ) characters')
  .nullable();

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: nameSchema.optional(),
      bio: bioSchema.optional(),
      dateOfBirth: dateOfBirthSchema.optional(),
      sex: sexSchema.optional(),
      phone: phoneSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'No updatable fields provided',
    }),
});

export const deleteAccountSchema = z.object({
  body: z.object({
    password: z.string().min(1, 'Password is required to confirm account deletion'),
  }),
});
