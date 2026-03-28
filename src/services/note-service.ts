import type { Database } from "@/db/schema";
import { toNote, type Note } from "@/models";
import type { Kysely } from "kysely";
import {
  addTagToEntry,
  fetchTagsByEntryIds,
  fetchTagsForEntry,
  removeTagFromEntry,
} from "./tag-helpers";

export function createNoteService(db: Kysely<Database>) {
  return {
    create: async (content: string, tagIds?: string[]) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await db.transaction().execute(async (trx) => {
        await trx
          .insertInto("entries")
          .values({
            id,
            date: new Date().toLocaleDateString("en-CA"),
            content,
            type: "note",
            status: null,
            createdAt: now,
            updatedAt: now,
          })
          .execute();
        if (tagIds) {
          for (const tagId of tagIds) {
            await addTagToEntry(trx, id, tagId);
          }
        }
      });
    },
    get: async (id: string): Promise<Note | undefined> => {
      const result = await db
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", id)
        .where("type", "=", "note")
        .executeTakeFirst();
      if (!result) return undefined;
      const tags = await fetchTagsForEntry(db, result.id);
      return toNote(result, tags);
    },
    update: async (id: string, { content }: { content: string }) => {
      await db
        .updateTable("entries")
        .set({
          content,
          updatedAt: new Date().toISOString(),
        })
        .where("id", "=", id)
        .where("type", "=", "note")
        .execute();
    },
    delete: async (id: string) => {
      await db.deleteFrom("entries").where("id", "=", id).where("type", "=", "note").execute();
    },
    togglePin: async (id: string, pinned: boolean) => {
      await db
        .updateTable("entries")
        .set({
          status: pinned ? "pinned" : null,
          updatedAt: new Date().toISOString(),
        })
        .where("id", "=", id)
        .where("type", "=", "note")
        .execute();
    },
    getPinned: async (): Promise<Note[]> => {
      const results = await db
        .selectFrom("entries")
        .selectAll()
        .where("type", "=", "note")
        .where("status", "=", "pinned")
        .orderBy("updatedAt", "desc")
        .execute();
      const tagMap = await fetchTagsByEntryIds(
        db,
        results.map((r) => r.id),
      );
      return results.map((r) => toNote(r, tagMap.get(r.id) ?? []));
    },
    addTag: async (noteId: string, tagId: string) => {
      await addTagToEntry(db, noteId, tagId);
    },
    removeTag: async (noteId: string, tagId: string) => {
      await removeTagFromEntry(db, noteId, tagId);
    },
  };
}
