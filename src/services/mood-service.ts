import { db } from "@/db/client";
import { toLocalISO } from "@/utils/dates";

export const moodService = {
  async delete(id: string) {
    await db.deleteFrom("moods").where("id", "=", id).execute();
  },
  async createMood(value: number, label: string | null = null) {
    const localISO = toLocalISO(new Date());
    await db
      .insertInto("moods")
      .values({
        id: crypto.randomUUID(),
        value,
        label,
        date: localISO.slice(0, 10),
        created_at: localISO,
      })
      .execute();
  },
};
