import { getSnapshot, setSnapshot } from "@app/persistence";
import { store } from "@app/store";
import { useEffect, useRef } from "react";

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
