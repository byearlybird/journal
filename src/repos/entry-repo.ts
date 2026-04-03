import type { Database, EntryRow } from "@/db";
import { extractPlainText } from "@/utils/extract-plain-text";
import type { Kysely, Transaction as KyselyTransaction } from "kysely";
import { sql } from "kysely";

type Transaction = KyselyTransaction<Database>;

async function saveChangelog(
  executor: Kysely<Database> | Transaction,
  recordId: string,
  recordType: string,
  record: unknown,
): Promise<void> {
  await executor
    .insertInto("_changelog")
    .values({
      recordId,
      recordType,
      payload: JSON.stringify(record),
    })
    .execute();
}

export type EntryRepo = ReturnType<typeof createEntryRepo>;
export function createEntryRepo(db: Kysely<Database>) {
  return {
    get: (id: string, tx?: Transaction) => {
      const executor = tx ?? db;
      return executor
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", id)
        .where("isDeleted", "=", 0)
        .executeTakeFirst();
    },
    transaction: <T>(run: (trx: Transaction) => Promise<T>) => {
      return db.transaction().execute(run);
    },
    getAll: () => {
      return db
        .selectFrom("entries")
        .selectAll()
        .where("isDeleted", "=", 0)
        .orderBy("createdAt", "desc")
        .execute();
    },
    getByDate: (date: string) => {
      return db
        .selectFrom("entries")
        .selectAll()
        .where("date", "=", date)
        .where("isDeleted", "=", 0)
        .orderBy("createdAt", "desc")
        .execute();
    },
    getByMonth: (month: string, tx?: Transaction) => {
      const executor = tx ?? db;
      return executor
        .selectFrom("entries")
        .selectAll()
        .where("date", "like", `${month}%`)
        .where("isDeleted", "=", 0)
        .orderBy("createdAt", "desc")
        .executeTakeFirst();
    },
    getByStatus: (type: EntryRow["type"], status: string) => {
      return db
        .selectFrom("entries")
        .selectAll()
        .where("type", "=", type)
        .where("status", "=", status)
        .where("isDeleted", "=", 0)
        .orderBy("updatedAt", "desc")
        .execute();
    },
    getByOriginId: (originId: string, tx?: Transaction) => {
      const executor = tx ?? db;
      return executor
        .selectFrom("entries")
        .selectAll()
        .where("originId", "=", originId)
        .where("isDeleted", "=", 0)
        .executeTakeFirst();
    },
    searchByContent: (query: string, limit = 10) => {
      return db
        .selectFrom("entries")
        .innerJoin("entrySearchMeta", "entrySearchMeta.entryId", "entries.id")
        .selectAll("entries")
        .where("entrySearchMeta.plainText", "like", sql<string>`'%' || ${query} || '%'`)
        .where("entries.isDeleted", "=", 0)
        .orderBy("entries.createdAt", "desc")
        .limit(limit)
        .execute();
    },
    create: async (
      entry: Omit<EntryRow, "id" | "createdAt" | "updatedAt" | "isDeleted">,
      tx?: Transaction,
    ): Promise<string> => {
      const run = async (executor: Transaction): Promise<string> => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const newEntry: EntryRow = {
          ...entry,
          id,
          createdAt: now,
          updatedAt: now,
          isDeleted: 0,
        };
        await executor.insertInto("entries").values(newEntry).execute();
        await executor
          .insertInto("entrySearchMeta")
          .values({ entryId: id, plainText: extractPlainText(entry.content) })
          .execute();
        await saveChangelog(executor, id, "entries", newEntry);
        return id;
      };

      if (tx) {
        return run(tx);
      }
      return db.transaction().execute(run);
    },
    update: async (
      id: string,
      entry: Partial<Omit<EntryRow, "id" | "updatedAt" | "isDeleted">>,
      tx?: Transaction,
    ) => {
      const run = async (executor: Transaction): Promise<void> => {
        const updatedAt = new Date().toISOString();
        await executor
          .updateTable("entries")
          .set({ ...entry, updatedAt })
          .where("id", "=", id)
          .execute();
        if (entry.content !== undefined) {
          const plainText = extractPlainText(entry.content);
          await executor
            .insertInto("entrySearchMeta")
            .values({ entryId: id, plainText })
            .onConflict((oc) => oc.column("entryId").doUpdateSet({ plainText }))
            .execute();
        }
        const updatedEntry = await executor
          .selectFrom("entries")
          .selectAll()
          .where("id", "=", id)
          .executeTakeFirstOrThrow();
        await saveChangelog(executor, id, "entries", updatedEntry);
      };

      if (tx) {
        await run(tx);
      } else {
        await db.transaction().execute(run);
      }
    },
    delete: async (id: string, tx?: Transaction) => {
      const run = async (executor: Transaction): Promise<void> => {
        const updatedAt = new Date().toISOString();
        await executor
          .updateTable("entries")
          .set({ isDeleted: 1, updatedAt })
          .where("id", "=", id)
          .execute();
        const deletedEntry = await executor
          .selectFrom("entries")
          .selectAll()
          .where("id", "=", id)
          .executeTakeFirstOrThrow();
        await saveChangelog(executor, id, "entries", deletedEntry);
      };

      if (tx) {
        await run(tx);
      } else {
        await db.transaction().execute(run);
      }
    },
  };
}
