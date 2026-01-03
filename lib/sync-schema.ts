import { z } from "zod";

export const pushPayloadSchema = z.object({
	data: z.string(),
});

export const pullResponseSchema = z.object({
	content: z.string(),
});

export type PushPayload = z.infer<typeof pushPayloadSchema>;
export type PullResponse = z.infer<typeof pullResponseSchema>;
