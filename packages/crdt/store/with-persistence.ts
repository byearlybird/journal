import type { State } from "../core/types";
import type { PersistenceProvider } from "../persistence";
import type { Store } from "../store";

export type PersistentStore<T> = Store<T> & {
	load: () => Promise<void>;
};

export const withPersistence = <T>(
	store: Store<T>,
	{
		key,
		persistenceProvider,
	}: {
		key: string;
		persistenceProvider: PersistenceProvider;
	},
): PersistentStore<T> => {
	const persist = async () => {
		const state = store.getState();
		await persistenceProvider.set(key, state);
	};

	const load = async () => {
		const state = await persistenceProvider.get<State>(key);
		if (state) {
			store.setState(state);
		}
	};

	store.on("mutate", () => {
		persist();
	});

	return { ...store, load };
};
