import { db } from "@app/db/db";
import { dump, merge } from "@app/db/merger";
import { hc } from "hono/client";
import type { AppType } from "../../../worker/index";

const client = hc<AppType>("/");

/**
 * Fetches encrypted data from remote server.
 * Returns null if fetch fails.
 */
async function fetchFromRemote(): Promise<string | null> {
	try {
		const response = await client.api.journal.$get();

		if (!response.ok) {
			console.error("Failed to fetch from remote:", response.status);
			return null;
		}

		const data = await response.json();
		return data.data;
	} catch (err) {
		console.error("Failed to fetch from remote:", err);
		return null;
	}
}

/**
 * Uploads encrypted data to remote server.
 * Returns true if successful.
 */
async function uploadToRemote(data: string): Promise<boolean> {
	try {
		const response = await client.api.journal.$put({
			json: { data },
		});

		if (!response.ok) {
			console.error("Failed to upload to remote:", response.status);
			return false;
		}

		return true;
	} catch (err) {
		console.error("Failed to upload to remote:", err);
		return false;
	}
}

/**
 * Pulls remote data and merges it into local database.
 * Returns true if successful.
 */
export async function syncPull(): Promise<boolean> {
	const remoteData = await fetchFromRemote();

	if (!remoteData) {
		return false;
	}

	try {
		await merge(db, remoteData);
		return true;
	} catch (err) {
		console.error("Failed to merge remote data:", err);
		return false;
	}
}

/**
 * Dumps local database and pushes it to remote server.
 * Returns true if successful.
 */
export async function syncPush(): Promise<boolean> {
	try {
		const localData = await dump(db);
		return await uploadToRemote(localData);
	} catch (err) {
		console.error("Failed to dump database:", err);
		return false;
	}
}

/**
 * Performs a full sync: pull remote changes, then push local changes.
 * Skips pushing if pull fails to avoid out-of-date overwrites.
 * Returns true if pull succeeded (caller may want to refresh UI).
 */
export async function sync(): Promise<boolean> {
	if (!navigator.onLine) return false;

	const pullSucceeded = await syncPull();

	// Only push if pull succeeded to avoid conflicts
	if (pullSucceeded) {
		await syncPush();
	}

	return pullSucceeded;
}
