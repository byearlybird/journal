import { createStore } from "@byearlybird/starling";
import { noteSchema, taskSchema } from "./schema";

export const store = createStore({
  collections: {
    notes: {
      schema: noteSchema,
      keyPath: "id",
    },
    tasks: {
      schema: taskSchema,
      keyPath: "id",
    },
  },
});
