import { type Kysely, type Migration } from "kysely";

export const Migration20260201Init: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("notes")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .addColumn("date", "text", (cb) => cb.notNull())
      .addColumn("scope", "text", (cb) => cb.notNull())
      .addColumn("category", "text", (cb) => cb.notNull())
      .addColumn("is_deleted", "integer", (cb) => cb.notNull().defaultTo(0))
      .execute();

    await db.schema
      .createTable("tasks")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("updated_at", "text", (cb) => cb.notNull())
      .addColumn("date", "text", (cb) => cb.notNull())
      .addColumn("scope", "text", (cb) => cb.notNull())
      .addColumn("status", "text", (cb) => cb.notNull())
      .addColumn("is_deleted", "integer", (cb) => cb.notNull().defaultTo(0))
      .execute();
  },
  async down(db: Kysely<any>) {
    await db.schema.dropTable("notes").execute();
    await db.schema.dropTable("tasks").execute();
  },
};
