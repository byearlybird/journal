// oxlint-disable typescript/no-explicit-any
import type { Kysely, Migration } from "kysely";

export const M007_blob_outboxes: Migration = {
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("blob_uploads")
      .ifNotExists()
      .addColumn("blob_id", "text", (cb) => cb.primaryKey())
      .addColumn("enqueued_at", "text", (cb) => cb.notNull())
      .execute();

    await db.schema
      .createTable("blob_deletes")
      .ifNotExists()
      .addColumn("blob_id", "text", (cb) => cb.primaryKey())
      .addColumn("enqueued_at", "text", (cb) => cb.notNull())
      .execute();
  },
};
