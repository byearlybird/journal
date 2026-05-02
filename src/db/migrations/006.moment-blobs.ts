// oxlint-disable typescript/no-explicit-any
import { sql } from "kysely";
import type { Kysely, Migration } from "kysely";
import { installSyncTriggers } from "./sync-helpers";

export const M006_moment_blobs: Migration = {
  async up(db: Kysely<any>) {
    // Drop the timeline view first — it references `mo.image`, which the
    // table-rename below would try (and fail) to rebind.
    await sql`DROP VIEW IF EXISTS timeline`.execute(db);

    await db.schema
      .createTable("blobs")
      .ifNotExists()
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("data", "blob", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .execute();

    await db.schema
      .createTable("moments_new")
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("image_blob_id", "text", (cb) => cb.defaultTo(null))
      .addColumn("thumbnail_blob_id", "text", (cb) => cb.defaultTo(null))
      .addColumn("date", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("content_edited_at", "text", (cb) => cb.defaultTo(null))
      .addColumn("label", "text", (cb) => cb.defaultTo(null))
      .addColumn("hlc", "text", (cb) => cb.defaultTo(null))
      .execute();

    const existing = await db.selectFrom("moments").selectAll().execute();

    for (const row of existing) {
      let imageBlobId: string | null = null;
      let thumbnailBlobId: string | null = null;

      if (row.image) {
        imageBlobId = crypto.randomUUID();
        await db
          .insertInto("blobs")
          .values({ id: imageBlobId, data: row.image, created_at: row.created_at })
          .execute();
      }

      if (row.thumbnail) {
        thumbnailBlobId = crypto.randomUUID();
        await db
          .insertInto("blobs")
          .values({ id: thumbnailBlobId, data: row.thumbnail, created_at: row.created_at })
          .execute();
      }

      await db
        .insertInto("moments_new")
        .values({
          id: row.id,
          content: row.content,
          image_blob_id: imageBlobId,
          thumbnail_blob_id: thumbnailBlobId,
          date: row.date,
          created_at: row.created_at,
          content_edited_at: row.content_edited_at,
          label: row.label,
          hlc: row.hlc,
        })
        .execute();
    }

    await sql`DROP TABLE moments`.execute(db);
    await sql`ALTER TABLE moments_new RENAME TO moments`.execute(db);

    await installSyncTriggers(db, "moments");

    await sql`
      CREATE VIEW timeline AS
      SELECT n.id, 'note' AS type, n.content, NULL AS value, n.created_at, NULL AS status, n.pinned, 0 AS has_image, l.name AS label_name
      FROM notes n LEFT JOIN labels l ON l.id = n.label
      UNION ALL
      SELECT t.id, 'task' AS type, t.content, NULL AS value, t.created_at, t.status, 0 AS pinned, 0 AS has_image, l.name AS label_name
      FROM tasks t LEFT JOIN labels l ON l.id = t.label
      UNION ALL
      SELECT m.id, 'mood' AS type, NULL AS content, m.value, m.created_at, NULL AS status, 0 AS pinned, 0 AS has_image, l.name AS label_name
      FROM moods m LEFT JOIN labels l ON l.id = m.label
      UNION ALL
      SELECT mo.id, 'moment' AS type, mo.content, NULL AS value, mo.created_at, NULL AS status, 0 AS pinned,
             CASE WHEN mo.image_blob_id IS NULL THEN 0 ELSE 1 END AS has_image,
             l.name AS label_name
      FROM moments mo LEFT JOIN labels l ON l.id = mo.label
    `.execute(db);
  },
};
