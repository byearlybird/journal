import z from "zod";

const envSchema = z.object({
  PUBLIC_API_BASE_URL: z.string().default("http://localhost:3000"),
});

export const ENV = envSchema.parse({
  PUBLIC_API_BASE_URL: process.env.PUBLIC_API_BASE_URL,
});
