import { z } from "zod";

const baseSchema = z.object({
	id: z.uuid().default(() => crypto.randomUUID()),
	createdAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export const noteSchema = baseSchema.extend({
	content: z.string(),
});

export const taskSchema = baseSchema.extend({
	content: z.string(),
	status: z
		.literal(["incomplete", "complete", "deferred"])
		.default("incomplete"),
});

export const commentSchema = baseSchema.extend({
	entryId: z.uuid(), // could be a task or a note
	content: z.string(),
});

export type Note = z.infer<typeof noteSchema>;

export type Task = z.infer<typeof taskSchema>;

export type Comment = z.infer<typeof commentSchema>;

// Discriminated union for entries (notes and tasks)
export type Entry = (Note & { type: "note" }) | (Task & { type: "task" });

export type EntryType = Entry["type"];
