import type { StoreSnapshot } from "@byearlybird/starling";
import * as idb from "idb-keyval";
import type { Store } from ".";

const POLL_INTERVAL_MS = 5000;
const STORE_KEY = "journal";

export function initPersistence(store: Store): {
	ready: Promise<void>;
	stop: () => void;
} {
	const mergeSnapshot = (snapshot: StoreSnapshot | null) => {
		if (!snapshot) return;
		store.merge(snapshot);
	};

	const unlisten = store.$snapshot.listen((snapshot) => {
		setSnapshot(snapshot);
	});

	const stopPoll = pollSnapshot(mergeSnapshot);

	const initPromise = getSnapshot().then(mergeSnapshot);

	return {
		ready: initPromise,
		stop: () => {
			unlisten();
			stopPoll();
		},
	};
}

function pollSnapshot(callback: (snapshot: StoreSnapshot | null) => void) {
	const pollInterval = setInterval(() => {
		getSnapshot().then((snapshot) => {
			callback(snapshot);
		});
	}, POLL_INTERVAL_MS);

	return () => clearInterval(pollInterval);
}

function setSnapshot(snapshot: StoreSnapshot) {
	return idb.set(STORE_KEY, snapshot);
}

function getSnapshot(): Promise<StoreSnapshot | null> {
	return idb.get(STORE_KEY).then((data) => data ?? null);
}
