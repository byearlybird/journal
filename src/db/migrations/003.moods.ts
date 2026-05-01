import { sql } from "kysely";
import type { Kysely, Migration } from "kysely";
import { createSyncTable } from "./sync-helpers";

export const M003_moods: Migration = {
  // oxlint-disable-next-line typescript/no-explicit-any
  async up(db: Kysely<any>) {
    await createSyncTable(db, "moods", (t) =>
      t
        .addColumn("id", "text", (cb) => cb.primaryKey())
        .addColumn("value", "integer", (cb) => cb.notNull())
        .addColumn("date", "text", (cb) => cb.notNull())
        .addColumn("created_at", "text", (cb) => cb.notNull())
        .addColumn("label", "text", (cb) => cb.defaultTo(null)),
    );

    await sql`DROP VIEW IF EXISTS timeline`.execute(db);
    await sql`
      CREATE VIEW IF NOT EXISTS timeline AS
      SELECT n.id, 'note' AS type, n.content, NULL AS value, n.created_at, NULL AS status, n.pinned, l.name AS label_name
      FROM notes n
      LEFT JOIN labels l ON l.id = n.label
      UNION ALL
      SELECT t.id, 'task' AS type, t.content, NULL AS value, t.created_at, t.status, 0 AS pinned, l.name AS label_name
      FROM tasks t
      LEFT JOIN labels l ON l.id = t.label
      UNION ALL
      SELECT m.id, 'mood' AS type, NULL AS content, m.value, m.created_at, NULL AS status, 0 AS pinned, l.name AS label_name
      FROM moods m
      LEFT JOIN labels l ON l.id = m.label
    `.execute(db);
  },
};
