import { z } from 'zod';

export const uuidParamSchema = (paramName = 'id') =>
  z.object({
    params: z.object({
      [paramName]: z.string().uuid(),
    }),
  });
