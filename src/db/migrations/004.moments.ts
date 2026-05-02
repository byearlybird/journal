import { sql } from "kysely";
import type { Kysely, Migration } from "kysely";

export const M004_moments: Migration = {
  // oxlint-disable-next-line typescript/no-explicit-any
  async up(db: Kysely<any>) {
    await db.schema
      .createTable("moments")
      .ifNotExists()
      .addColumn("id", "text", (cb) => cb.primaryKey())
      .addColumn("content", "text", (cb) => cb.notNull())
      .addColumn("image", "blob")
      .addColumn("date", "text", (cb) => cb.notNull())
      .addColumn("created_at", "text", (cb) => cb.notNull())
      .addColumn("content_edited_at", "text", (cb) => cb.defaultTo(null))
      .addColumn("label", "text", (cb) => cb.defaultTo(null))
      .addColumn("hlc", "text", (cb) => cb.defaultTo(null))
      .execute();

    await sql`DROP VIEW IF EXISTS timeline`.execute(db);
    await sql`
      CREATE VIEW IF NOT EXISTS timeline AS
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
             CASE WHEN mo.image IS NULL THEN 0 ELSE 1 END AS has_image,
             l.name AS label_name
      FROM moments mo LEFT JOIN labels l ON l.id = mo.label
    `.execute(db);
  },
};
