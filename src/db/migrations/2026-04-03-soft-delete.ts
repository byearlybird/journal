import type { Kysely, Migration } from "kysely";

export const Migration20260403SoftDelete: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .alterTable("entries")
      .addColumn("isDeleted", "integer", (col) => col.notNull().defaultTo(0))
      .execute();

    await db.schema
      .alterTable("labels")
      .addColumn("isDeleted", "integer", (col) => col.notNull().defaultTo(0))
      .execute();
  },

  async down(db: Kysely<any>) {
    await db.transaction().execute(async (trx) => {
      // SQLite requires recreating tables to drop columns
      // Backup entries data (excluding soft-deleted ones and the isDeleted column)
      const entries = await trx
        .selectFrom("entries")
        .select(["id", "date", "content", "createdAt", "updatedAt", "type", "status", "originId", "labelId"])
        .where("isDeleted", "=", 0)
        .execute();

      // Backup labels data (excluding soft-deleted ones and the isDeleted column)
      const labels = await trx
        .selectFrom("labels")
        .select(["id", "name"])
        .where("isDeleted", "=", 0)
        .execute();

      // Recreate entries table without isDeleted
      await trx.schema.dropTable("entries").execute();
      await trx.schema
        .createTable("entries")
        .addColumn("id", "text", (cb) => cb.primaryKey())
        .addColumn("date", "text", (cb) => cb.notNull())
        .addColumn("content", "text", (cb) => cb.notNull())
        .addColumn("createdAt", "text", (cb) => cb.notNull())
        .addColumn("updatedAt", "text", (cb) => cb.notNull())
        .addColumn("type", "text", (cb) => cb.notNull())
        .addColumn("status", "text")
        .addColumn("originId", "text")
        .addColumn("labelId", "text")
        .execute();

      // Recreate labels table without isDeleted
      await trx.schema.dropTable("labels").execute();
      await trx.schema
        .createTable("labels")
        .addColumn("id", "text", (col) => col.primaryKey())
        .addColumn("name", "text", (col) => col.notNull())
        .execute();

      // Restore entries
      for (const entry of entries) {
        await trx.insertInto("entries").values(entry).execute();
      }

      // Restore labels
      for (const label of labels) {
        await trx.insertInto("labels").values(label).execute();
      }
    });
  },
};
