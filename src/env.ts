import z from "zod";

const envSchema = z.object({
  VITE_CLERK_PUBLISHABLE_KEY: z.string(),
  VITE_API_BASE_URL: z.string().default("http://localhost:3000"),
});

export const ENV = envSchema.parse(import.meta.env);
