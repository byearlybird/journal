import { define, Store } from "@byearlybird/starling";
import { noteSchema, taskSchema } from "./schema";

export const store = new Store({
  notes: define(noteSchema, (d) => d.id),
  tasks: define(taskSchema, (d) => d.id),
});
