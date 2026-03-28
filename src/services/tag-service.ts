import type { Database } from "@/db/schema";
import type { Tag } from "@/models";
import type { Kysely } from "kysely";

export function createTagService(db: Kysely<Database>) {
  return {
    async getAll(): Promise<Tag[]> {
      return db.selectFrom("tags").select(["id", "name"]).orderBy("name", "asc").execute();
    },
    async create(name: string): Promise<Tag> {
      const tag = { id: crypto.randomUUID(), name };
      await db.insertInto("tags").values(tag).execute();
      return tag;
    },
    async update(id: string, name: string): Promise<void> {
      await db.updateTable("tags").set({ name }).where("id", "=", id).execute();
    },
    async delete(id: string): Promise<void> {
      await db.transaction().execute(async (trx) => {
        await trx.deleteFrom("entryTags").where("tagId", "=", id).execute();
        await trx.deleteFrom("tags").where("id", "=", id).execute();
      });
    },
  };
}
