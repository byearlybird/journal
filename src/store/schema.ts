import z from "zod";

export const noteSchema = z.object({
  id: z.uuid().default(() => crypto.randomUUID()),
  content: z.string(),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export type Note = z.infer<typeof noteSchema>;
export type NewNote = z.input<typeof noteSchema>;
