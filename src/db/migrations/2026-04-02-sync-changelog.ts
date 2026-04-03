import type { Migration } from "kysely";

export const Migration20260402SyncChangelog: Migration = {
  async up(db) {
    await db.schema
      .createTable("_changelog")
      .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
      .addColumn("recordId", "text", (col) => col.notNull())
      .addColumn("recordType", "text", (col) => col.notNull())
      .addColumn("payload", "text", (col) => col.notNull())
      .execute();

    await db.schema
      .createTable("_sync_meta")
      .addColumn("key", "text", (col) => col.primaryKey())
      .addColumn("value", "text", (col) => col.notNull())
      .execute();

    await db.insertInto("_sync_meta").values({ key: "cursor", value: "0" }).execute();
  },

  async down(db) {
    await db.schema.dropTable("_sync_meta").execute();
    await db.schema.dropTable("_changelog").execute();
  },
};
