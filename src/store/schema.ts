import z from "zod";

const baseSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

const baseEntrySchema = baseSchema.extend({
  content: z.string().min(1),
  date: z.iso.date().default(() => new Date().toISOString()),
  scope: z.enum(["daily", "weekly", "monthly"]),
  tagIds: z.array(z.uuid()).default([]),
});

export const tagSchema = baseSchema.extend({
  name: z.string().min(1),
});

export const noteSchema = baseEntrySchema.extend({
  category: z.enum(["log", "intention", "reflection"]),
});

export const taskSchema = baseEntrySchema.extend({
  status: z.enum(["incomplete", "complete", "canceled"]).default("incomplete"),
});

export type Note = z.infer<typeof noteSchema>;
export type Task = z.infer<typeof taskSchema>;
export type Tag = z.infer<typeof tagSchema>;

export type NewNote = z.input<typeof noteSchema>;
export type NewTask = z.input<typeof taskSchema>;
export type NewTag = z.input<typeof tagSchema>;
