import type { Database, LabelRow } from "@/db";
import type { Kysely, Transaction as KyselyTransaction } from "kysely";

type Transaction = KyselyTransaction<Database>;

export type LabelRepo = ReturnType<typeof createLabelRepo>;
export function createLabelRepo(db: Kysely<Database>) {
  return {
    get(id: string) {
      return db
        .selectFrom("labels")
        .select(["id", "name"])
        .where("id", "=", id)
        .where("isDeleted", "=", 0)
        .executeTakeFirst();
    },
    getAll() {
      return db
        .selectFrom("labels")
        .select(["id", "name"])
        .where("isDeleted", "=", 0)
        .orderBy("name", "asc")
        .execute();
    },
    getByIds(ids: string[]) {
      if (!ids.length) return Promise.resolve([]);
      return db
        .selectFrom("labels")
        .select(["id", "name"])
        .where("id", "in", ids)
        .where("isDeleted", "=", 0)
        .execute();
    },
    create: async (
      label: Omit<LabelRow, "id" | "createdAt" | "updatedAt">,
      tx?: Transaction,
    ): Promise<string> => {
      const run = async (executor: Kysely<Database> | Transaction) => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const fullRecord: LabelRow = { ...label, id, createdAt: now, updatedAt: now };
        await executor.insertInto("labels").values(fullRecord).execute();
        await executor
          .insertInto("_changelog")
          .values({
            recordId: id,
            recordType: "labels",
            payload: JSON.stringify(fullRecord),
          })
          .execute();
        return id;
      };
      if (tx) {
        return run(tx);
      }
      return db.transaction().execute(run);
    },
    update: async (
      id: string,
      label: Partial<Omit<LabelRow, "id" | "updatedAt">>,
      tx?: Transaction,
    ) => {
      const run = async (executor: Kysely<Database> | Transaction) => {
        const updatedAt = new Date().toISOString();
        await executor
          .updateTable("labels")
          .set({ ...label, updatedAt })
          .where("id", "=", id)
          .execute();
        const fullRecord = await executor
          .selectFrom("labels")
          .selectAll()
          .where("id", "=", id)
          .executeTakeFirst();
        if (fullRecord) {
          await executor
            .insertInto("_changelog")
            .values({
              recordId: id,
              recordType: "labels",
              payload: JSON.stringify(fullRecord),
            })
            .execute();
        }
      };
      if (tx) {
        await run(tx);
      } else {
        await db.transaction().execute(run);
      }
    },
    delete: async (id: string, tx?: Transaction) => {
      const run = async (executor: Kysely<Database> | Transaction) => {
        const fullRecord = await executor
          .selectFrom("labels")
          .selectAll()
          .where("id", "=", id)
          .executeTakeFirst();
        if (!fullRecord) return;

        await executor
          .updateTable("entries")
          .set({ labelId: null })
          .where("labelId", "=", id)
          .execute();
        const updatedAt = new Date().toISOString();
        await executor
          .updateTable("labels")
          .set({ isDeleted: 1, updatedAt })
          .where("id", "=", id)
          .execute();
        const deletedRecord: LabelRow = { ...fullRecord, isDeleted: 1, updatedAt };
        await executor
          .insertInto("_changelog")
          .values({
            recordId: id,
            recordType: "labels",
            payload: JSON.stringify(deletedRecord),
          })
          .execute();
      };
      if (tx) {
        await run(tx);
      } else {
        await db.transaction().execute(run);
      }
    },
  };
}
