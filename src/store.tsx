import { createStore } from "@byearlybird/starling";
import * as idb from "idb-keyval";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useSyncExternalStore,
	useState,
} from "react";
import z from "zod";

const noteSchema = z.object({
	id: z.uuid().default(() => crypto.randomUUID()),
	content: z.string(),
	createdAt: z.iso.datetime().default(() => new Date().toISOString()),
	updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export const store = createStore({
	collections: {
		notes: {
			schema: noteSchema,
		},
	},
});

const LOAD_INTERVAL_MS = 5000; // 5 seconds

type StoreType = typeof store;

const loadFromIdb = () => {
	return idb.get("journal").then((data) => {
		console.log("data", data);
		if (data) {
			store.merge(data);
		}
	});
};

export function startPersisting() {
	const unsubscribe = store.$snapshot.listen((snapshot) => {
		console.log("snapshot", snapshot);
		idb.set("journal", snapshot);
	});

	// Load immediately
	const loadPromise = loadFromIdb();

	// Then load at interval
	const intervalId = setInterval(loadFromIdb, LOAD_INTERVAL_MS);

	const stop = () => {
		console.log("stopping persisting");
		unsubscribe();
		clearInterval(intervalId);
	};

	return { stop, loadPromise };
}

type StoreContextValue = StoreType;

const StoreContext = createContext<StoreContextValue | null>(null);

// Singleton persistence instance - lives outside React's lifecycle
let persistenceInstance: ReturnType<typeof startPersisting> | null = null;

function ensurePersistence() {
	if (!persistenceInstance) {
		persistenceInstance = startPersisting();
	}
	return persistenceInstance;
}

export function StoreProvider({ children }: { children: ReactNode }) {
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		let ignore = false;
		const { loadPromise } = ensurePersistence();

		loadPromise.then(() => {
			if (!ignore) {
				console.log("Store initialized");
				setIsInitialized(true);
			}
		});

		return () => {
			ignore = true;
			// No stop() call - persistence runs for app lifetime
		};
	}, []);

	if (!isInitialized) {
		return null;
	}

	return (
		<StoreContext.Provider value={store}>{children}</StoreContext.Provider>
	);
}

export function useStoreContext() {
	const context = useContext(StoreContext);
	if (!context) {
		throw new Error("useStoreContext must be used within StoreProvider");
	}
	return context;
}

export function useNotes() {
	const store = useStoreContext();
	// Memoize the query to prevent recreation on each render
	const $notesQuery = useMemo(
		() => store.query(["notes"], ({ notes }) => Array.from(notes.values())),
		[store],
	);
	// Use useSyncExternalStore to properly handle external store subscriptions
	// This avoids the "Cannot update a component while rendering" error
	return useSyncExternalStore(
		(onStoreChange) => {
			// Subscribe function - returns unsubscribe
			return $notesQuery.subscribe(onStoreChange);
		},
		() => {
			// Get snapshot function
			return $notesQuery.get();
		},
		() => {
			// Server snapshot (not used in client, but required by useSyncExternalStore)
			return [];
		},
	);
}
