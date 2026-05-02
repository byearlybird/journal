// oxlint-disable typescript/no-explicit-any
import { sql } from "kysely";
import type { CreateTableBuilder, Kysely } from "kysely";

/**
 * Creates a synced table with the `hlc` column and installs the three triggers:
 *   INSERT  — stamps hlc when hlc IS NULL (local write), queues a 'mutate' change
 *   UPDATE  — re-stamps when hlc hasn't changed (local edit), queues a 'mutate' change
 *   BEFORE DELETE — writes a tombstone, queues a 'tombstone' change; skipped when
 *                   client_state.is_applying_remote = 1 so pulled deletes don't
 *                   re-enter the outbox.
 *
 * The hlc column stores a lexicographically-sortable string:
 *   printf('%015d', hlc_wall) || '@' || printf('%08d', hlc_count) || '@' || node_id
 */
export async function createSyncTable(
  db: Kysely<any>,
  tableName: string,
  configure: (builder: CreateTableBuilder<typeof tableName, never>) => CreateTableBuilder<any, any>,
): Promise<void> {
  await configure(db.schema.createTable(tableName).ifNotExists())
    .addColumn("hlc", "text", (cb) => cb.defaultTo(null))
    .execute();

  const advanceClock = `
      UPDATE client_state SET
        hlc_count = CASE
          WHEN CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER) > hlc_wall
            THEN 0
          ELSE hlc_count + 1
        END,
        hlc_wall = MAX(hlc_wall, CAST(unixepoch('now', 'subsec') * 1000 AS INTEGER))
      WHERE id = 1;`;

  const hlcExpr = `(
    printf('%015d', (SELECT hlc_wall FROM client_state WHERE id = 1))
    || '@' ||
    printf('%08d', (SELECT hlc_count FROM client_state WHERE id = 1))
    || '@' ||
    (SELECT node_id FROM client_state WHERE id = 1)
  )`;

  const mutateBody = sql.raw(`
      ${advanceClock}
      UPDATE ${tableName} SET hlc = ${hlcExpr} WHERE id = NEW.id;
      INSERT INTO sync_changes (table_name, row_id, hlc, operation)
        VALUES ('${tableName}', NEW.id, (SELECT hlc FROM ${tableName} WHERE id = NEW.id), 'mutate')
        ON CONFLICT(table_name, row_id) DO UPDATE SET hlc = excluded.hlc, operation = excluded.operation;
  `);

  const tombstoneBody = sql.raw(`
      ${advanceClock}
      INSERT INTO tombstone_table (row_id, hlc)
        VALUES (OLD.id, ${hlcExpr})
        ON CONFLICT(row_id) DO UPDATE SET hlc = excluded.hlc;
      INSERT INTO sync_changes (table_name, row_id, hlc, operation)
        VALUES ('${tableName}', OLD.id, (SELECT hlc FROM tombstone_table WHERE row_id = OLD.id), 'tombstone')
        ON CONFLICT(table_name, row_id) DO UPDATE SET hlc = excluded.hlc, operation = 'tombstone';
  `);

  await sql`
    CREATE TRIGGER IF NOT EXISTS ${sql.raw(tableName)}_after_insert
    AFTER INSERT ON ${sql.raw(tableName)}
    WHEN NEW.hlc IS NULL
    BEGIN
      ${mutateBody}
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS ${sql.raw(tableName)}_after_update
    AFTER UPDATE ON ${sql.raw(tableName)}
    WHEN NEW.hlc IS OLD.hlc
    BEGIN
      ${mutateBody}
    END
  `.execute(db);

  await sql`
    CREATE TRIGGER IF NOT EXISTS ${sql.raw(tableName)}_before_delete
    BEFORE DELETE ON ${sql.raw(tableName)}
    WHEN (SELECT is_applying_remote FROM client_state WHERE id = 1) = 0
    BEGIN
      ${tombstoneBody}
    END
  `.execute(db);
}
