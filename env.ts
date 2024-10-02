import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().default(8778),
  API_BASE_URL: z.coerce.string().default('http://localhost'),
  GEMINI_API_KEY: z.coerce.string(),
  DATABASE_URL: z.coerce.string().url().default("file:./dev.db"),
  ROOT: z.coerce.string().default(__dirname)
});

export const env = envSchema.parse(process.env);