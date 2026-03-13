import z from "zod";

export const noteSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  content: z.string().min(1),
  date: z.iso.date().default(() => new Date().toISOString().split("T")[0]),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  editedAt: z.iso.datetime().nullable().default(null),
});

export const taskSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  content: z.string().min(1),
  date: z.iso.date().default(() => new Date().toISOString().split("T")[0]),
  status: z.enum(["incomplete", "complete", "canceled"]).default("incomplete"),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  editedAt: z.iso.datetime().nullable().default(null),
});

export type Note = z.infer<typeof noteSchema>;
export type Task = z.infer<typeof taskSchema>;
export type NewNote = z.input<typeof noteSchema>;
export type NewTask = z.input<typeof taskSchema>;
