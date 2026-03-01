import z from "zod";

const envSchema = z.object({
  CLERK_SECRET_KEY: z.string(),
  PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);
