import { db } from "@/db/client";
import { toLocalISO } from "@/utils/dates";

export const intentionService = {
  async setCurrentMonthIntention(content: string) {
    const month = new Date().toISOString().slice(0, 7);
    return intentionService.createIntention(content, month);
  },
  async createIntention(content: string, month: string) {
    const localISO = toLocalISO(new Date());

    await db
      .insertInto("intentions")
      .values({
        id: month,
        content,
        month,
        created_at: localISO,
      })
      .onConflict((oc) => oc.column("id").doUpdateSet({ content, content_edited_at: localISO }))
      .execute();
  },
};
