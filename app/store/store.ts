import { createStore } from "@byearlybird/starling";
import z from "zod";

const noteSchema = z.object({
	id: z.uuid().default(() => crypto.randomUUID()),
	content: z.string(),
	createdAt: z.iso.datetime().default(() => new Date().toISOString()),
	updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export const store = createStore({
	collections: {
		notes: {
			schema: noteSchema,
		},
	},
});

export type Store = typeof store;

export type Note = z.infer<typeof noteSchema>;
