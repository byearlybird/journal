import { createStore } from "@byearlybird/starling";
import { noteSchema } from "./schema";

export const store = createStore({
	collections: {
		notes: {
			schema: noteSchema,
		},
	},
});

export type Store = typeof store;
