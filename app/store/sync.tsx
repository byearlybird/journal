import { client, db } from "@app/db/db";
import { merge } from "@app/db/merger";
import { getCryptoKey } from "@app/store/crypto-key";
import { useSession } from "@clerk/clerk-react";
import { decryptFile, encryptFile } from "@lib/crypto";
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
 * Validates a crypto key by attempting to fetch and decrypt remote data.
 * Returns true if the key is valid (decryption succeeds or no data exists).
 * Returns false if decryption fails (wrong passphrase).
 */
export async function validateCryptoKey(
	cryptoKey: CryptoKey,
): Promise<boolean> {
	try {
		const res = await fetch(API_ENDPOINT, {
			method: "GET",
		});

		if (res.status === 404 || res.status === 200) {
			const arrayBuffer = await res.arrayBuffer();
			if (arrayBuffer.byteLength === 0) {
				// No remote data yet, key is valid by default
				return true;
			}

			// Try to decrypt - if this fails, key is wrong
			await decryptFile(arrayBuffer, cryptoKey);
			return true;
		}

		return true;
	} catch (err) {
		// Decryption failed - wrong key
		console.error("Key validation failed:", err);
		return false;
	}
}

/**
 * Pulls encrypted database file from the remote server, decrypts it, and merges it into the local database.
 * Returns true if successful, false otherwise.
 */
async function pullFromRemote(cryptoKey: CryptoKey): Promise<boolean> {
	try {
		const res = await fetch(API_ENDPOINT, {
			method: "GET",
		});

		if (res.status === 404) {
			// No remote data yet, this is fine
			return true;
		}

		const encryptedArrayBuffer = await res.arrayBuffer();
		if (encryptedArrayBuffer.byteLength === 0) {
			// No remote data yet, this is fine
			return true;
		}

		// Decrypt and merge
		try {
			const decryptedArrayBuffer = await decryptFile(
				encryptedArrayBuffer,
				cryptoKey,
			);
			// Convert ArrayBuffer to File for merge function
			const dbFile = new File([decryptedArrayBuffer], "database.sqlite3", {
				type: "application/x-sqlite3",
			});
			await merge(db, dbFile);
			return true;
		} catch (err) {
			console.error("Decryption or merge failed:", err);
			return false;
		}
	} catch (err) {
		console.error("Failed to pull data:", err);
		return false;
	}
}

/**
 * Pushes the current database file to the remote server as encrypted data.
 */
async function pushToRemote(cryptoKey: CryptoKey): Promise<void> {
	try {
		const dbFile = await client.getDatabaseFile();
		const encryptedArrayBuffer = await encryptFile(dbFile, cryptoKey);

		await fetch(API_ENDPOINT, {
			method: "PUT",
			headers: { "Content-Type": "application/octet-stream" },
			body: encryptedArrayBuffer,
		});
	} catch (err) {
		console.error("Failed to push data:", err);
	}
}

/**
 * Performs a full sync: pulls remote data (if available) and then pushes local data.
 */
async function syncWithRemote(queryClient: QueryClient): Promise<void> {
	const cryptoKey = getCryptoKey();
	if (!cryptoKey) {
		// No crypto key available, skip sync
		return;
	}

	// Pull first, then push (even if pull fails, we still want to push)
	await pullFromRemote(cryptoKey);
	await pushToRemote(cryptoKey);
	queryClient.invalidateQueries();
}
