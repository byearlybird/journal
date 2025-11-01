import { createDatabase } from "@byearlybird/starling";
import { idbPlugin } from "@byearlybird/starling/plugin-idb";
import { CommentSchema, EntrySchema } from "./schema";

export const db = createDatabase({
	name: "journal",
	version: 1,
	schema: {
		entries: {
			schema: EntrySchema,
			getId: (entry) => entry.id,
		},
		comments: {
			schema: CommentSchema,
			getId: (comment) => comment.id,
		},
	},
}).use(idbPlugin());
