import { getDb } from "./client";
import type { Note, Task } from "./schema";

export interface DatabaseDump {
  notes: Note[];
  tasks: Task[];
  schemaVersion: number;
}

/**
 * Dumps the entire database (notes and tasks) as a JSON-serializable object.
 * Includes both active and soft-deleted items for sync.
 */
export async function dumpDatabase(): Promise<DatabaseDump> {
  const db = await getDb();
  const [notes, tasks] = await Promise.all([db.getAll("notes"), db.getAll("tasks")]);

  return {
    notes,
    tasks,
    schemaVersion: 1,
  };
}

/**
 * Merges a database dump into the local database using last-write-wins conflict resolution.
 * Compares updatedAt timestamps to determine which version to keep.
 * Uses a transaction to ensure atomicity.
 */
export async function mergeIntoDatabase(dump: DatabaseDump): Promise<void> {
  if (dump.schemaVersion !== 1) {
    throw new Error(`Unsupported schema version: ${dump.schemaVersion}`);
  }

  const db = await getDb();
  const tx = db.transaction(["notes", "tasks"], "readwrite");
  const notesStore = tx.objectStore("notes");
  const tasksStore = tx.objectStore("tasks");

  for (const remoteNote of dump.notes) {
    const localNote = await notesStore.get(remoteNote.id);
    if (!localNote) {
      await notesStore.put(remoteNote);
    } else if (remoteNote.updatedAt > localNote.updatedAt) {
      await notesStore.put(remoteNote);
    }
  }

  for (const remoteTask of dump.tasks) {
    const localTask = await tasksStore.get(remoteTask.id);
    if (!localTask) {
      await tasksStore.put(remoteTask);
    } else if (remoteTask.updatedAt > localTask.updatedAt) {
      await tasksStore.put(remoteTask);
    }
  }

  await tx.done;
}
