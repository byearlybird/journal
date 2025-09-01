import { err, ok, type Result } from "@journal/fn";
import { z } from "zod";

const commentSchema = z.object({
	_id: z.uuid().default(() => crypto.randomUUID()),
	content: z.string().min(1),
	createdAt: z.iso.datetime().default(() => new Date().toISOString()),
});

const entrySchema = z.object({
	_id: z.uuid().default(() => crypto.randomUUID()),
	content: z.string().min(1),
	createdAt: z.iso.datetime().default(() => new Date().toISOString()),
	// biome-ignore lint/style/noNonNullAssertion: split of toISOString always returns at least one element
	date: z.iso.date().default(() => new Date().toISOString().split("T")[0]!),
	isBookmarked: z.boolean().default(false),
	comments: z.array(commentSchema).default([]),
});

export const makeEntry = (data: NewEntry): Result<Entry, string> => {
	const parsed = entrySchema.safeParse(data);
	return parsed.success ? ok(parsed.data) : err(parsed.error.message);
};

export const makeComment = (data: NewComment): Result<Comment, string> => {
	const parsed = commentSchema.safeParse(data);
	return parsed.success ? ok(parsed.data) : err(parsed.error.message);
};

export type Entry = z.infer<typeof entrySchema>;
export type NewEntry = z.input<typeof entrySchema>;
export type PartialEntry = Partial<Entry>;
export type Comment = z.infer<typeof commentSchema>;
export type NewComment = z.input<typeof commentSchema>;
export type PartialComment = Partial<Comment>;
