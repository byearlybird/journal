import { type Kysely, type Migration } from "kysely";

export const Migration20260319RemoveScopeCategory: Migration = {
  async up(db: Kysely<any>) {
    await db.schema.alterTable("notes").dropColumn("scope").execute();
    await db.schema.alterTable("notes").dropColumn("category").execute();
    await db.schema.alterTable("tasks").dropColumn("scope").execute();
  },
  async down(db: Kysely<any>) {
    await db.schema
      .alterTable("notes")
      .addColumn("scope", "text", (cb) => cb.notNull().defaultTo(""))
      .execute();
    await db.schema
      .alterTable("notes")
      .addColumn("category", "text", (cb) => cb.notNull().defaultTo(""))
      .execute();
    await db.schema
      .alterTable("tasks")
      .addColumn("scope", "text", (cb) => cb.notNull().defaultTo(""))
      .execute();
  },
};
