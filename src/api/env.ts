import z from "zod";

const envSchema = z.object({
  CLERK_SECRET_KEY: z.string(),
  PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  DATABASE_URL: z.string(),
  DATABASE_AUTH_TOKEN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
