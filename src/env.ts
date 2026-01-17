import z from "zod";

const envSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
});

export const ENV = envSchema.parse(import.meta.env);
