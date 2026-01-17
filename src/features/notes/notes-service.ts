import { db, type NewNote, type Note } from "@app/db";
import { format, parseISO } from "date-fns";
import { sql } from "kysely";

export const NotesService = {
  getAllGroupedByDate: async () => {
    const notes = await db
      .selectFrom("note")
      .orderBy("created_at", "desc")
      .where("deleted_at", "is", null)
      .selectAll()
      .execute();

    const grouped: Record<string, Note[]> = {};

    for (const note of notes) {
      const noteDate = parseISO(note.created_at);
      const date = format(noteDate, "yyyy-MM-dd");
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(note);
    }

    return grouped;
  },
  getToday: async () => {
    const notes = await db
      .selectFrom("note")
      .where(sql`DATE(created_at)`, "=", sql`DATE('now')`)
      .where("deleted_at", "is", null)
      .orderBy("created_at", "desc")
      .selectAll()
      .execute();

    return notes;
  },
  create: (note: Pick<NewNote, "content">) => {
    const now = new Date().toISOString();

    const newNote: Note = {
      id: crypto.randomUUID(),
      content: note.content,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };

    return db.insertInto("note").values(newNote).execute();
  },
};
