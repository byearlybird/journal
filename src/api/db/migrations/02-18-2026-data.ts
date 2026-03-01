import { type Kysely, type Migration } from "kysely";

export const Migration20260218Backups: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("backups")
      .addColumn("id", "text", (col) => col.primaryKey())
      .addColumn("user_id", "text", (col) => col.notNull().unique())
      .addColumn("data", "text", (col) => col.notNull())
      .addColumn("created_at", "text", (col) => col.notNull())
      .addColumn("updated_at", "text", (col) => col.notNull())
      .execute();
  },
  async down(db: Kysely<any>) {
    await db.schema.dropTable("backups").execute();
  },
};
