import { createDatabase } from "@byearlybird/starling";
import { idbPlugin } from "@byearlybird/starling/plugin-idb";
import { commentSchema, noteSchema, taskSchema } from "./schema";

export const db = createDatabase({
	name: "journal",
	version: 1,
	schema: {
		notes: {
			schema: noteSchema,
			getId: (note) => note.id,
		},
		comments: {
			schema: commentSchema,
			getId: (comment) => comment.id,
		},
		tasks: {
			schema: taskSchema,
			getId: (task) => task.id,
		},
	},
}).use(idbPlugin());
