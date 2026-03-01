import z from "zod";

const envSchema = z.object({
  PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
});

export const ENV = envSchema.parse({
  PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
});
