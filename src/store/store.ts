import { createStore } from "@byearlybird/starling";
import { noteSchema } from "./schema";

export const store = createStore({
  collections: {
    notes: {
      schema: noteSchema,
      keyPath: "id",
    },
  },
});
