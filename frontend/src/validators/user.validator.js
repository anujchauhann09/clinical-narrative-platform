import { z } from 'zod';

const emptyToNull = (value) => (value === '' || value === undefined ? null : value);

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  bio: z
    .preprocess(emptyToNull, z.string().trim().max(2000).nullable())
    .optional(),
  dateOfBirth: z
    .preprocess(
      emptyToNull,
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
        .refine(
          (value) => new Date(`${value}T00:00:00`) <= new Date(),
          'Date of birth cannot be in the future',
        )
        .nullable(),
    )
    .optional(),
  sex: z.preprocess(emptyToNull, z.string().trim().max(40).nullable()).optional(),
  phone: z
    .preprocess(
      emptyToNull,
      z
        .string()
        .trim()
        .max(32)
        .regex(/^[+\d][\d\s\-().]*$/, 'Enter a valid phone number')
        .nullable(),
    )
    .optional(),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});
