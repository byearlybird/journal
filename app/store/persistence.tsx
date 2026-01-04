import type { StoreSnapshot } from "@byearlybird/starling";
import * as idb from "idb-keyval";
import { useEffect, useRef } from "react";
import { store } from ".";

// Keys
const PREFIX = "journal";
export const STORE_KEY = `${PREFIX}:store`;

// Functions
export function getSnapshot() {
	return idb.get(STORE_KEY);
}

export function setSnapshot(snapshot: StoreSnapshot) {
	return idb.set(STORE_KEY, snapshot);
}

export function clearSnapshot() {
	return idb.del(STORE_KEY);
}

// Hooks
const POLL_IDB_INTERVAL_MS = 3000; // 3 seconds

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

// Initialization
export async function load() {
	const snapshot = await getSnapshot();
	if (snapshot) {
		store.merge(snapshot);
	}
}
