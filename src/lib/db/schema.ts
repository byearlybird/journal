import { z } from "zod";

export const CommentSchema = z.object({
	id: z.uuid().default(() => crypto.randomUUID()),
	entryId: z.uuid(),
	content: z.string(),
	createdAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Comment = z.infer<typeof CommentSchema>;

export const EntrySchema = z.object({
	id: z.uuid().default(() => crypto.randomUUID()),
	content: z.string(),
	createdAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Entry = z.infer<typeof EntrySchema>;
