import { db } from "@app/db/db";
import { dump, merge } from "@app/db/merger";
import { useSession } from "@clerk/clerk-react";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

const POLL_REMOTE_INTERVAL_MS = 10000; // 10 seconds
const API_ENDPOINT = "/api/journal";

export function useSync() {
	const { isSignedIn } = useSession();
	const queryClient = useQueryClient();
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		if (!isSignedIn) {
			// Clear interval if user signs out
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			return;
		}

		// Start polling remote
		intervalRef.current = setInterval(
			() => syncWithRemote(queryClient),
			POLL_REMOTE_INTERVAL_MS,
		);

		// Cleanup on unmount or when signed out
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isSignedIn, queryClient]);
}

/**
 * Pulls JSON state from the remote server and merges it into the local database.
 * Returns true if successful, false otherwise.
 */
async function pullFromRemote(): Promise<boolean> {
	try {
		const res = await fetch(API_ENDPOINT, {
			method: "GET",
		});

		if (res.status === 404) {
			// No remote data yet, this is fine
			return true;
		}

		const jsonString = await res.text();
		if (!jsonString || jsonString.trim().length === 0) {
			// No remote data yet, this is fine
			return true;
		}

		// Merge remote JSON state into local database
		await merge(db, jsonString);
		return true;
	} catch (err) {
		console.error("Failed to pull or merge data:", err);
		return false;
	}
}

/**
 * Pushes the current database state as JSON to the remote server.
 */
async function pushToRemote(): Promise<void> {
	try {
		const jsonString = await dump(db);

		await fetch(API_ENDPOINT, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: jsonString,
		});
	} catch (err) {
		console.error("Failed to push data:", err);
	}
}

/**
 * Performs a full sync: pulls remote data (if available) and then pushes local data.
 */
async function syncWithRemote(queryClient: QueryClient): Promise<void> {
	// Pull first, then push (even if pull fails, we still want to push)
	await pullFromRemote();
	await pushToRemote();
	queryClient.invalidateQueries();
}
