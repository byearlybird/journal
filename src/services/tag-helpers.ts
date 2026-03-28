import type { Database } from "@/db/schema";
import type { Tag } from "@/models";
import type { Kysely } from "kysely";

export async function fetchTagsForEntry(db: Kysely<Database>, entryId: string): Promise<Tag[]> {
  return db
    .selectFrom("entryTags")
    .innerJoin("tags", "tags.id", "entryTags.tagId")
    .select(["tags.id", "tags.name"])
    .where("entryTags.entryId", "=", entryId)
    .execute();
}

export async function fetchTagsByEntryIds(
  db: Kysely<Database>,
  entryIds: string[],
): Promise<Map<string, Tag[]>> {
  if (!entryIds.length) return new Map();
  const rows = await db
    .selectFrom("entryTags")
    .innerJoin("tags", "tags.id", "entryTags.tagId")
    .select(["tags.id", "tags.name", "entryTags.entryId"])
    .where("entryTags.entryId", "in", entryIds)
    .execute();
  return Map.groupBy(rows, (r) => r.entryId);
}

export async function addTagToEntry(
  db: Kysely<Database>,
  entryId: string,
  tagId: string,
): Promise<void> {
  await db.insertInto("entryTags").values({ id: crypto.randomUUID(), entryId, tagId }).execute();
}

export async function removeTagFromEntry(
  db: Kysely<Database>,
  entryId: string,
  tagId: string,
): Promise<void> {
  await db
    .deleteFrom("entryTags")
    .where("entryId", "=", entryId)
    .where("tagId", "=", tagId)
    .execute();
}
