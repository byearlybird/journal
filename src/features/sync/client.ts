import { type DatabaseDump, dumpDatabase, mergeIntoDatabase } from "@/db";

// Flag to prevent infinite loop when syncing triggers store changes
let isSyncing = false;

/**
 * Returns true if a sync operation is currently in progress.
 */
export function getIsSyncing(): boolean {
  return isSyncing;
}

/**
 * Fetches remote data and returns it as a parsed DatabaseDump.
 * Returns null if no remote data exists yet (404).
 */
export async function syncPull(token: string): Promise<DatabaseDump | null> {
  const response = await fetch("/api/v0/backup", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch from remote: HTTP ${response.status}`);
  }

  const json = (await response.json()) as { data: string };
  return JSON.parse(json.data) as DatabaseDump;
}

/**
 * Pushes pre-serialized data to remote server.
 */
export async function syncPush(token: string, data: string): Promise<void> {
  const response = await fetch("/api/v0/backup", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to remote: HTTP ${response.status}`);
  }
}

/**
 * Performs a full sync: pull remote changes, merge, then dump and push.
 * Skips pushing if pull fails to avoid out-of-date overwrites.
 */
export async function syncDatabase(token: string): Promise<void> {
  if (!navigator.onLine) {
    throw new Error("Offline");
  }

  isSyncing = true;
  try {
    const remote = await syncPull(token);
    if (remote) {
      await mergeIntoDatabase(remote);
    }
    const dump = await dumpDatabase();
    await syncPush(token, JSON.stringify(dump));
  } finally {
    isSyncing = false;
  }
}
