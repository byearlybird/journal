import { getCryptoKey, getSnapshot, setSnapshot } from "@app/persistence";
import { store } from "@app/store";
import { useSession } from "@clerk/clerk-react";
import { decrypt, encrypt } from "@lib/crypto";
import { pullResponseSchema, pushPayloadSchema } from "@lib/sync-schema";
import { useEffect, useRef } from "react";

const POLL_IDB_INTERVAL_MS = 3000; // 3 seconds
const POLL_REMOTE_INTERVAL_MS = 10000; // 10 seconds

export function usePersistence() {
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	useEffect(() => {
		// Start polling
		intervalRef.current = setInterval(() => {
			getSnapshot().then((snapshot) => {
				if (snapshot) {
					store.merge(snapshot);
				}
			});
		}, POLL_IDB_INTERVAL_MS);

		// Sync changes to IDB
		store.$snapshot.subscribe((snapshot) => {
			if (snapshot) {
				setSnapshot(snapshot);
			}
		});

		// Cleanup on unmount
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, []);
}

export function useRemotePersistence() {
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
		intervalRef.current = setInterval(async () => {
			const cryptoKey = await getCryptoKey();
			if (!cryptoKey) {
				// No crypto key available, skip sync
				return;
			}

			// Pull first
			try {
				const res = await fetch("/api/journal", {
					method: "GET",
					headers: { "Content-Type": "application/json" },
				});

				// Handle empty response (no data stored yet)
				const responseText = await res.text();
				if (!responseText) {
					// No remote data, proceed to push
				} else {
					// Parse and validate response
					let data: unknown;
					try {
						data = JSON.parse(responseText);
					} catch (err) {
						console.error("Failed to parse response as JSON:", err);
						return;
					}

					const validated = pullResponseSchema.parse(data);
					if (validated.content) {
						try {
							const decrypted = await decrypt(validated.content, cryptoKey);
							const parsedData = JSON.parse(decrypted);
							store.merge(parsedData);
						} catch (err) {
							console.error("Decryption failed:", err);
							// Skip sync if decryption fails
							return;
						}
					}
				}
			} catch (err) {
				if (err instanceof Error && err.name === "ZodError") {
					console.error("Invalid response format from server:", err);
				} else {
					console.error("Failed to pull data:", err);
				}
				return;
			}

			// Then push (encrypted)
			try {
				const snapshot = store.$snapshot.get();
				const encrypted = await encrypt(JSON.stringify(snapshot), cryptoKey);
				const payload = pushPayloadSchema.parse({ data: encrypted });
				await fetch("/api/journal", {
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});
			} catch (err) {
				console.error("Failed to push data:", err);
			}
		}, POLL_REMOTE_INTERVAL_MS);

		// Cleanup on unmount or when signed out
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [isSignedIn]);
}
