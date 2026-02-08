import { dbService } from "./service";
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
    dbService.select<Note>("SELECT * FROM notes"),
    dbService.select<Task>("SELECT * FROM tasks"),
  ]);

  return {
    notes,
    tasks,
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

  await dbService.transaction(async () => {
    // Merge notes
    for (const remoteNote of dump.notes) {
      const [localNote] = await dbService.select<Note>("SELECT * FROM notes WHERE id = $1", [remoteNote.id]);

      if (!localNote) {
        await dbService.execute(
          "INSERT INTO notes (id, content, created_at, updated_at, date, scope, category, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [remoteNote.id, remoteNote.content, remoteNote.created_at, remoteNote.updated_at, remoteNote.date, remoteNote.scope, remoteNote.category, remoteNote.is_deleted],
        );
        continue;
      }

      if (remoteNote.updated_at > localNote.updated_at) {
        await dbService.execute(
          "UPDATE notes SET content = $1, created_at = $2, updated_at = $3, date = $4, scope = $5, category = $6, is_deleted = $7 WHERE id = $8",
          [remoteNote.content, remoteNote.created_at, remoteNote.updated_at, remoteNote.date, remoteNote.scope, remoteNote.category, remoteNote.is_deleted, remoteNote.id],
        );
      }
    }

    // Merge tasks
    for (const remoteTask of dump.tasks) {
      const [localTask] = await dbService.select<Task>("SELECT * FROM tasks WHERE id = $1", [remoteTask.id]);

      if (!localTask) {
        await dbService.execute(
          "INSERT INTO tasks (id, content, created_at, updated_at, date, scope, status, is_deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [remoteTask.id, remoteTask.content, remoteTask.created_at, remoteTask.updated_at, remoteTask.date, remoteTask.scope, remoteTask.status, remoteTask.is_deleted],
        );
        continue;
      }

      if (remoteTask.updated_at > localTask.updated_at) {
        await dbService.execute(
          "UPDATE tasks SET content = $1, created_at = $2, updated_at = $3, date = $4, scope = $5, status = $6, is_deleted = $7 WHERE id = $8",
          [remoteTask.content, remoteTask.created_at, remoteTask.updated_at, remoteTask.date, remoteTask.scope, remoteTask.status, remoteTask.is_deleted, remoteTask.id],
        );
      }
    }
  });
}
