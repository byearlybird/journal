import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	type CreateEntryInput,
	type Entry,
	entry,
	entryStore,
} from "../collections/entries";

const StoreContext = createContext<{
	data: Record<string, Entry>;
	store: typeof entryStore;
} | null>(null);

export function RepoProvider({ children }: { children: ReactNode }) {
	const [data, setData] = useState<Record<string, Entry>>({});

	useEffect(() => {
		const refreshData = () => {
			entryStore.load().then(() => {
				const data = entryStore.get();
				setData(data || {});
			});
		};

		refreshData();
		const unsub = entryStore.on("mutate", refreshData);

		return () => {
			unsub();
		};
	}, []);

	const contextValue = useMemo(() => ({ data, store: entryStore }), [data]);

	return (
		<StoreContext.Provider value={contextValue}>
			{children}
		</StoreContext.Provider>
	);
}

export function useStore() {
	const store = useContext(StoreContext);
	if (!store) {
		throw new Error("useStore must be used within a StoreProvider");
	}
	return store;
}

export function useQuery<T>(selector: (data: Record<string, Entry>) => T) {
	const { data } = useStore();
	return useMemo(() => selector(data), [data, selector]);
}

export function useMutate() {
	const { store } = useStore();

	const insert = useCallback(
		(data: CreateEntryInput) => {
			const parsedData = entry(data);
			store.set({ [parsedData.$id]: parsedData });
		},
		[store],
	);

	const update = useCallback(
		(id: string, mutator: (current: Entry) => Partial<Omit<Entry, "$id">>) => {
			const currentData = store.get() || {};
			const current = currentData[id];
			if (!current) return;

			const modified = mutator(current);
			store.set({ [id]: { ...current, ...modified } });
		},
		[store],
	);

	return useMemo(() => ({ insert, update }), [insert, update]);
}
