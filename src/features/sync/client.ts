import { ENV } from "@app/env";
import { dumpDatabase, mergeIntoDatabase } from "@app/db";
import { type Result, err, ok } from "@app/utils/result";

// API response types
type JournalGetResponse = { data: string };
type JournalPutRequest = { data: string };

// Flag to prevent infinite loop when syncing triggers store changes
let isSyncing = false;

/**
 * Returns true if a sync operation is currently in progress.
 */
export function getIsSyncing(): boolean {
  return isSyncing;
}

/**
 * Fetches encrypted data from remote server.
 * Returns Ok with data (null means 404/no remote data yet).
 * Returns Err on failure.
 *
 * TODO: Add authentication headers once auth system is implemented.
 */
async function fetchFromRemote(): Promise<Result<string | null, string>> {
  try {
    const response = await fetch(`${ENV.VITE_API_BASE_URL}/api/journal`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add auth token header here
      },
    });

    if (!response.ok) {
      // 404 means no remote data yet - this is valid for new users
      if (response.status === 404) {
        return ok(null);
      }

      // Other errors are real failures
      console.error("Failed to fetch from remote:", response.status);
      return err(`HTTP ${response.status}`);
    }

    const json = (await response.json()) as JournalGetResponse;
    return ok(json.data);
  } catch (error) {
    console.error("Failed to fetch from remote:", error);
    return err(error instanceof Error ? error.message : "Unknown error");
  }
}

/**
 * Uploads encrypted data to remote server.
 *
 * TODO: Add authentication headers once auth system is implemented.
 */
async function uploadToRemote(data: string): Promise<Result<void, string>> {
  try {
    const body: JournalPutRequest = { data };
    const response = await fetch(`${ENV.VITE_API_BASE_URL}/api/journal`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // TODO: Add auth token header here
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error("Failed to upload to remote:", response.status);
      return err(`HTTP ${response.status}`);
    }

    return ok(undefined);
  } catch (error) {
    console.error("Failed to upload to remote:", error);
    return err(error instanceof Error ? error.message : "Unknown error");
  }
}

/**
 * Pulls remote data and merges it into local database.
 * Succeeds even when no remote data exists yet (404).
 */
export async function syncPull(): Promise<Result<void, string>> {
  const result = await fetchFromRemote();

  if (!result.ok) {
    return err(result.error);
  }

  // No remote data yet (404) - nothing to merge, but not an error
  if (!result.data) {
    return ok(undefined);
  }

  try {
    await mergeIntoDatabase(JSON.parse(result.data));
    return ok(undefined);
  } catch (error) {
    console.error("Failed to merge remote data:", error);
    return err(error instanceof Error ? error.message : "Failed to merge");
  }
}

/**
 * Dumps local database and pushes it to remote server.
 */
export async function syncPush(): Promise<Result<void, string>> {
  try {
    const dump = await dumpDatabase();
    const localData = JSON.stringify(dump);
    return await uploadToRemote(localData);
  } catch (error) {
    console.error("Failed to dump database:", error);
    return err(error instanceof Error ? error.message : "Failed to dump");
  }
}

/**
 * Performs a full sync: pull remote changes, then push local changes.
 * Skips pushing if pull fails to avoid out-of-date overwrites.
 */
export async function sync(): Promise<Result<void, string>> {
  if (!navigator.onLine) {
    return err("Offline");
  }

  // Set flag to prevent sync-on-mutate from triggering during this operation
  isSyncing = true;
  try {
    const pullResult = await syncPull();

    // Only push if pull succeeded to avoid conflicts
    if (pullResult.ok) {
      await syncPush();
    }

    return pullResult;
  } finally {
    isSyncing = false;
  }
}
