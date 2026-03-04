import { sql, transaction } from "./client";
import type { Note, Task } from "./schema";

export interface DatabaseDump {
  notes: Note[];
  tasks: Task[];
  schema_version: number;
}

/**
 * Dumps the entire database (notes and tasks) as a JSON-serializable object.
 * Includes both active and soft-deleted items for sync.
 */
export async function dumpDatabase(): Promise<DatabaseDump> {
  const [notes, tasks] = await Promise.all([
    sql`SELECT * FROM notes`,
    sql`SELECT * FROM tasks`,
  ]);

  return {
    notes: notes as Note[],
    tasks: tasks as Task[],
    schema_version: 1,
  };
}

/**
 * Merges a database dump into the local database using last-write-wins conflict resolution.
 * Compares updated_at timestamps to determine which version to keep.
 * Uses a transaction to ensure atomicity - if any part fails, all changes are rolled back.
 */
export async function mergeIntoDatabase(dump: DatabaseDump): Promise<void> {
  if (dump.schema_version !== 1) {
    throw new Error(`Unsupported schema version: ${dump.schema_version}`);
  }

  await transaction(async (tx) => {
    // Merge notes
    for (const remoteNote of dump.notes) {
      const rows = await tx.sql`
        SELECT * FROM notes WHERE id = ${remoteNote.id} LIMIT 1
      `;
      const localNote = rows[0] as Note | undefined;

      if (!localNote) {
        await tx.sql`
          INSERT INTO notes (id, content, created_at, updated_at, date, scope, category, is_deleted)
          VALUES (${remoteNote.id}, ${remoteNote.content}, ${remoteNote.created_at}, ${remoteNote.updated_at}, ${remoteNote.date}, ${remoteNote.scope}, ${remoteNote.category}, ${remoteNote.is_deleted})
        `;
        continue;
      }

      // Last-write-wins: keep the version with the latest updated_at
      if (remoteNote.updated_at > localNote.updated_at) {
        await tx.sql`
          INSERT OR REPLACE INTO notes (id, content, created_at, updated_at, date, scope, category, is_deleted)
          VALUES (${remoteNote.id}, ${remoteNote.content}, ${remoteNote.created_at}, ${remoteNote.updated_at}, ${remoteNote.date}, ${remoteNote.scope}, ${remoteNote.category}, ${remoteNote.is_deleted})
        `;
      }
    }

    // Merge tasks
    for (const remoteTask of dump.tasks) {
      const rows = await tx.sql`
        SELECT * FROM tasks WHERE id = ${remoteTask.id} LIMIT 1
      `;
      const localTask = rows[0] as Task | undefined;

      if (!localTask) {
        await tx.sql`
          INSERT INTO tasks (id, content, created_at, updated_at, date, scope, status, is_deleted)
          VALUES (${remoteTask.id}, ${remoteTask.content}, ${remoteTask.created_at}, ${remoteTask.updated_at}, ${remoteTask.date}, ${remoteTask.scope}, ${remoteTask.status}, ${remoteTask.is_deleted})
        `;
        continue;
      }

      // Last-write-wins: keep the version with the latest updated_at
      if (remoteTask.updated_at > localTask.updated_at) {
        await tx.sql`
          INSERT OR REPLACE INTO tasks (id, content, created_at, updated_at, date, scope, status, is_deleted)
          VALUES (${remoteTask.id}, ${remoteTask.content}, ${remoteTask.created_at}, ${remoteTask.updated_at}, ${remoteTask.date}, ${remoteTask.scope}, ${remoteTask.status}, ${remoteTask.is_deleted})
        `;
      }
    }
  });
}
