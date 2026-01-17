import type { Kysely, Migration } from "kysely";

export const Migration20250101: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("note")
      .addColumn("id", "text", (c) => c.primaryKey().notNull())
      .addColumn("content", "text", (c) => c.notNull())
      .addColumn("created_at", "text", (c) => c.notNull())
      .addColumn("updated_at", "text", (c) => c.notNull())
      .addColumn("deleted_at", "text")
      .execute();
  },
  async down(db: Kysely<any>) {
    await db.schema.dropTable("note").execute();
  },
};
