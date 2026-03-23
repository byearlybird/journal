import { db } from "./client";
import type { EntryRow } from "./schema";

export interface DatabaseDump {
  entries: EntryRow[];
  schema_version: number;
}

/**
 * Dumps the entire database (notes and tasks) as a JSON-serializable object.
 */
export async function dumpDatabase(): Promise<DatabaseDump> {
  const entries = await db.selectFrom("entries").selectAll().execute();

  return {
    entries,
    schema_version: 1,
  };
}

/**
 * Merges a database dump into the local database using last-write-wins conflict resolution.
 * Compares updatedAt timestamps to determine which version to keep.
 * Uses a transaction to ensure atomicity - if any part fails, all changes are rolled back.
 */
export async function mergeIntoDatabase(dump: DatabaseDump): Promise<void> {
  if (dump.schema_version !== 1) {
    throw new Error(`Unsupported schema version: ${dump.schema_version}`);
  }

  await db.transaction().execute(async (trx) => {
    for (const remoteEntry of dump.entries) {
      const localEntry = await trx
        .selectFrom("entries")
        .selectAll()
        .where("id", "=", remoteEntry.id)
        .executeTakeFirst();

      if (!localEntry) {
        await trx.insertInto("entries").values(remoteEntry).execute();
        continue;
      }

      if (remoteEntry.updatedAt > localEntry.updatedAt) {
        await trx.updateTable("entries").set(remoteEntry).where("id", "=", remoteEntry.id).execute();
      }
    }
  });
}
