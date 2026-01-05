import { store } from "@app/store";
import { getCryptoKey } from "@app/store/crypto-key";
import { useSession } from "@clerk/clerk-react";
import { decrypt, encrypt } from "@lib/crypto";
import { pullResponseSchema, pushPayloadSchema } from "@lib/sync-schema";
import { useEffect, useRef } from "react";

const POLL_REMOTE_INTERVAL_MS = 10000; // 10 seconds
const API_ENDPOINT = "/api/journal";
const JSON_HEADERS = { "Content-Type": "application/json" };

export function useSync() {
	const { isSignedIn } = useSession();
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
		intervalRef.current = setInterval(syncWithRemote, POLL_REMOTE_INTERVAL_MS);

		// Cleanup on unmount or when signed out
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isSignedIn]);
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
			headers: JSON_HEADERS,
		});

		const responseText = await res.text();
		if (!responseText) {
			// No remote data yet, key is valid by default
			return true;
		}

		// Parse response
		let data: unknown;
		try {
			data = JSON.parse(responseText);
		} catch {
			// Can't parse response, but that's not a key issue
			return true;
		}

		const validated = pullResponseSchema.parse(data);
		if (!validated.content) {
			return true; // No content, key is valid
		}

		// Try to decrypt - if this fails, key is wrong
		await decrypt(validated.content, cryptoKey);
		return true;
	} catch (err) {
		// Decryption failed - wrong key
		console.error("Key validation failed:", err);
		return false;
	}
}

/**
 * Pulls encrypted data from the remote server, decrypts it, and merges it into the store.
 * Returns true if successful, false otherwise.
 */
async function pullFromRemote(cryptoKey: CryptoKey): Promise<boolean> {
	try {
		const res = await fetch(API_ENDPOINT, {
			method: "GET",
			headers: JSON_HEADERS,
		});

		const responseText = await res.text();
		if (!responseText) {
			// No remote data yet, this is fine
			return true;
		}

		// Parse and validate response
		let data: unknown;
		try {
			data = JSON.parse(responseText);
		} catch (err) {
			console.error("Failed to parse response as JSON:", err);
			return false;
		}

		const validated = pullResponseSchema.parse(data);
		if (!validated.content) {
			return true; // No content to merge
		}

		// Decrypt and merge
		try {
			const decrypted = await decrypt(validated.content, cryptoKey);
			const parsedData = JSON.parse(decrypted);
			store.merge(parsedData);
			return true;
		} catch (err) {
			console.error("Decryption failed:", err);
			return false;
		}
	} catch (err) {
		if (err instanceof Error && err.name === "ZodError") {
			console.error("Invalid response format from server:", err);
		} else {
			console.error("Failed to pull data:", err);
		}
		return false;
	}
}

/**
 * Pushes the current store snapshot to the remote server as encrypted data.
 */
async function pushToRemote(cryptoKey: CryptoKey): Promise<void> {
	try {
		const snapshot = store.$snapshot.get();
		const encrypted = await encrypt(JSON.stringify(snapshot), cryptoKey);
		const payload = pushPayloadSchema.parse({ data: encrypted });

		await fetch(API_ENDPOINT, {
			method: "PUT",
			headers: JSON_HEADERS,
			body: JSON.stringify(payload),
		});
	} catch (err) {
		console.error("Failed to push data:", err);
	}
}

/**
 * Performs a full sync: pulls remote data (if available) and then pushes local data.
 */
async function syncWithRemote(): Promise<void> {
	const cryptoKey = getCryptoKey();
	if (!cryptoKey) {
		// No crypto key available, skip sync
		return;
	}

	// Pull first, then push (even if pull fails, we still want to push)
	await pullFromRemote(cryptoKey);
	await pushToRemote(cryptoKey);
}
