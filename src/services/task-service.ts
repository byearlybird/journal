import { db } from "@/db/client";
import { toLocalISO } from "@/utils/dates";

export const taskService = {
  async createTask(content: string) {
    const now = new Date();
    const localISO = toLocalISO(now);
    await db
      .insertInto("tasks")
      .values({
        id: crypto.randomUUID(),
        content,
        date: localISO.slice(0, 10),
        status: "incomplete",
        created_at: localISO,
      })
      .execute();
  },
};
