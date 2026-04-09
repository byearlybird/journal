import type { Kysely, Migration } from "kysely";

export const Migration20260403LabelsTimestamps: Migration = {
  async up(db: Kysely<any>) {
    const now = new Date().toISOString();

    await db.schema
      .alterTable("labels")
      .addColumn("createdAt", "text", (col) => col.notNull().defaultTo(now))
      .execute();

    await db.schema
      .alterTable("labels")
      .addColumn("updatedAt", "text", (col) => col.notNull().defaultTo(now))
      .execute();
  },

  async down(db: Kysely<any>) {
    await db.transaction().execute(async (trx) => {
      // SQLite requires recreating tables to drop columns
      // Backup labels data (excluding the timestamp columns)
      const labels = await trx.selectFrom("labels").select(["id", "name", "isDeleted"]).execute();

      // Recreate labels table without timestamp columns
      await trx.schema.dropTable("labels").execute();
      await trx.schema
        .createTable("labels")
        .addColumn("id", "text", (col) => col.primaryKey())
        .addColumn("name", "text", (col) => col.notNull())
        .addColumn("isDeleted", "integer", (col) => col.notNull().defaultTo(0))
        .execute();

      // Restore labels
      for (const label of labels) {
        await trx.insertInto("labels").values(label).execute();
      }
    });
  },
};
