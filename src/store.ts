import { createStore } from "@byearlybird/starling";
import { useStore } from "@nanostores/react";
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

export function useNotes() {
	const $all = store.query(["notes"], ({ notes }) =>
		Array.from(notes.values()),
	);
	return useStore($all);
}
