import { db } from "@/db/client";
import { toLocalISO } from "@/utils/dates";

export const notesService = {
  async createNote(content: string) {
    const now = new Date();
    const localISO = toLocalISO(now);
    await db
      .insertInto("notes")
      .values({
        id: crypto.randomUUID(),
        content,
        date: localISO.slice(0, 10),
        created_at: localISO,
      })
      .execute();
  },
};
