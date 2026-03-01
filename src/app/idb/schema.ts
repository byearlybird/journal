import z from "zod";
import type { DBSchema } from "idb";

const baseSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
  isDeleted: z.number().int().min(0).max(1).default(0),
});

const baseEntrySchema = baseSchema.extend({
  content: z.string().min(1),
  date: z.iso.date().default(() => new Date().toISOString().split("T")[0]!),
  scope: z.enum(["daily", "weekly", "monthly"]),
});

export const noteSchema = baseEntrySchema.extend({
  category: z.enum(["log", "intention", "reflection"]),
});

export const taskSchema = baseEntrySchema.extend({
  status: z.enum(["incomplete", "complete", "canceled"]).default("incomplete"),
});

export type Note = z.infer<typeof noteSchema>;
export type NoteIndex = z.infer<typeof noteIndexSchema>;
export type Task = z.infer<typeof taskSchema>;
export type TaskIndex = z.infer<typeof taskIndexSchema>;
export type NewNote = z.input<typeof noteSchema>;
export type NewTask = z.input<typeof taskSchema>;

const noteIndexSchema = noteSchema.pick({
  createdAt: true,
  date: true,
  isDeleted: true,
});

const taskIndexSchema = taskSchema.pick({
  createdAt: true,
  date: true,
  isDeleted: true,
});

export interface Database extends DBSchema {
  notes: {
    key: string;
    value: Note;
    indexes: NoteIndex;
  };
  tasks: {
    key: string;
    value: Task;
    indexes: TaskIndex;
  };
}
