import type { Database } from "@/db/schema";
import { toTask, type Task } from "@/models";
import type { Kysely } from "kysely";
import {
  addTagToEntry,
  fetchTagsByEntryIds,
  fetchTagsForEntry,
  removeTagFromEntry,
} from "./tag-helpers";

export function createTaskService(db: Kysely<Database>) {
  return {
    async create(content: string, tagIds?: string[]) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.transaction().execute(async (trx) => {
        await trx
          .insertInto("entries")
          .values({
            id,
            date: new Date().toLocaleDateString("en-CA"),
            content,
            type: "task",
            status: "incomplete",
            originId: null,
            createdAt: now,
            updatedAt: now,
          })
          .execute();
        if (tagIds?.length) {
          for (const tagId of tagIds) {
            await addTagToEntry(trx, id, tagId);
          }
        }
      });
    },
    async get(id: string): Promise<Task | undefined> {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", id)
        .where("type", "=", "task")
        .executeTakeFirst();
      if (!result) return undefined;
      const tags = await fetchTagsForEntry(db, result.id);
      return toTask(result, tags);
    },
    async update(id: string, updates: Partial<Pick<Task, "content" | "status">>) {
      await db
        .updateTable("entries")
        .set({
          ...updates,
          updatedAt: new Date().toISOString(),
        })
        .where("id", "=", id)
        .where("type", "=", "task")
        .execute();
    },
    async delete(id: string) {
      await db.deleteFrom("entries").where("id", "=", id).where("type", "=", "task").execute();
    },
    async getByStatus(status: Task["status"]): Promise<Task[]> {
      const results = await db
        .selectFrom("entries")
        .selectAll()
        .where("type", "=", "task")
        .where("status", "=", status)
        .execute();
      const tagMap = await fetchTagsByEntryIds(
        db,
        results.map((r) => r.id),
      );
      return results.map((r) => toTask(r, tagMap.get(r.id) ?? []));
    },
    async getFirstByOriginalId(originId: string): Promise<Task | undefined> {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("originId", "=", originId)
        .executeTakeFirst();
      if (!result) return undefined;
      const tags = await fetchTagsForEntry(db, result.id);
      return toTask(result, tags);
    },
    async rollover(taskId: string, targetDate: string) {
      await db.transaction().execute(async (trx) => {
        const existingTask = await trx
          .updateTable("entries")
          .set({
            status: "deferred",
            updatedAt: new Date().toISOString(),
          })
          .where("id", "=", taskId)
          .where("type", "=", "task")
          .returningAll()
          .executeTakeFirstOrThrow();
        const now = new Date().toISOString();
        await trx
          .insertInto("entries")
          .values({
            id: crypto.randomUUID(),
            date: targetDate,
            content: existingTask.content,
            type: "task",
            status: "incomplete",
            originId: existingTask.id,
            createdAt: now,
            updatedAt: now,
          })
          .execute();
      });
    },
    async addTag(taskId: string, tagId: string) {
      await addTagToEntry(db, taskId, tagId);
    },
    async removeTag(taskId: string, tagId: string) {
      await removeTagFromEntry(db, taskId, tagId);
    },
  };
}
