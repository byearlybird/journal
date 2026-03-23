import type { Kysely, Migration } from "kysely";

export const Migration001Init: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("entries")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("date", "text", (cb) => cb.notNull())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("createdAt", "text", (cb) => cb.notNull())
      .addColumn("updatedAt", "text", (cb) => cb.notNull())
      .addColumn("type", "text", (cb) => cb.notNull())
      .addColumn("status", "text")
      .addColumn("originId", "text")
      .execute();
  },

  async down(db: Kysely<any>) {
    await db.schema.dropTable("entries").execute();
  },
};
