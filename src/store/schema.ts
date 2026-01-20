import z from "zod";

const baseSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export const noteSchema = baseSchema.extend({
  content: z.string(),
});

export const taskSchema = baseSchema.extend({
  content: z.string(),
  status: z.enum(["incomplete", "complete", "cancelled"]).default("incomplete"),
});

export type Note = z.infer<typeof noteSchema>;
export type NewNote = z.input<typeof noteSchema>;

export type Task = z.infer<typeof taskSchema>;
export type NewTask = z.input<typeof taskSchema>;
