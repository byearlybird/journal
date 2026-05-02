import { sql } from "kysely";
import type { Kysely, Migration } from "kysely";
import { createSyncTable } from "./sync-helpers";

export const M004_moments: Migration = {
  // oxlint-disable-next-line typescript/no-explicit-any
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("blobs")
      .ifNotExists()
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("data", "blob", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .execute();

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

    await createSyncTable(db, "moments", (t) =>
      t
        .addColumn("id", "text", (cb) => cb.primaryKey())
        .addColumn("content", "text", (cb) => cb.notNull())
        .addColumn("image_blob_id", "text", (cb) => cb.defaultTo(null))
        .addColumn("thumbnail_blob_id", "text", (cb) => cb.defaultTo(null))
        .addColumn("date", "text", (cb) => cb.notNull())
        .addColumn("created_at", "text", (cb) => cb.notNull())
        .addColumn("content_edited_at", "text", (cb) => cb.defaultTo(null))
        .addColumn("label", "text", (cb) => cb.defaultTo(null)),
    );

    await sql`DROP VIEW IF EXISTS timeline`.execute(db);
    await sql`
      CREATE VIEW IF NOT EXISTS timeline AS
      SELECT n.id, 'note' AS type, n.content, NULL AS value, n.created_at, NULL AS status, n.pinned,
             NULL AS image_blob_id, NULL AS thumbnail_blob_id, l.name AS label_name
      FROM notes n LEFT JOIN labels l ON l.id = n.label
      UNION ALL
      SELECT t.id, 'task' AS type, t.content, NULL AS value, t.created_at, t.status, 0 AS pinned,
             NULL AS image_blob_id, NULL AS thumbnail_blob_id, l.name AS label_name
      FROM tasks t LEFT JOIN labels l ON l.id = t.label
      UNION ALL
      SELECT m.id, 'mood' AS type, NULL AS content, m.value, m.created_at, NULL AS status, 0 AS pinned,
             NULL AS image_blob_id, NULL AS thumbnail_blob_id, l.name AS label_name
      FROM moods m LEFT JOIN labels l ON l.id = m.label
      UNION ALL
      SELECT mo.id, 'moment' AS type, mo.content, NULL AS value, mo.created_at, NULL AS status, 0 AS pinned,
             mo.image_blob_id, mo.thumbnail_blob_id, l.name AS label_name
      FROM moments mo LEFT JOIN labels l ON l.id = mo.label
    `.execute(db);
  },
};
