import { createStore } from "@byearlybird/starling";
import { useStore } from "@nanostores/react";
import * as idb from "idb-keyval";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
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
		if (data) {
			store.merge(data);
		}
	});
};

export function startPersisting() {
	const unsubscribe = store.$snapshot.listen((snapshot) => {
		idb.set("journal", snapshot);
	});

	// Load immediately
	const loadPromise = loadFromIdb();

	// Then load at interval
	const intervalId = setInterval(loadFromIdb, LOAD_INTERVAL_MS);

	const stop = () => {
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

	return useStore(
		store.query(["notes"], ({ notes }) => Array.from(notes.values())),
		{
			deps: [store],
		},
	);
}
