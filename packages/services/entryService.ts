import type { PersistentStore, Store } from "@journal/crdt/store";
import { err, ok, type Result, when } from "@journal/fn";
import { type Entry, makeComment, makeEntry } from "@journal/schema";

const getEntries = (store: Store<Record<string, Entry>>) => {
	return store.get();
};

const createEntry = (
	store: Store<Record<string, Entry>>,
	content: string,
): Result<void, string> =>
	when(makeEntry({ content }), {
		ok: (data) => {
			store.set({ [data._id]: data });
			return ok();
		},
		err: (error) => err(`Validation error: ${error}`),
	});

const createComment = (
	store: Store<Record<string, Entry>>,
	entryId: string,
	content: string,
): Result<void, string> => {
	const entries = store.get();
	const entry = entries?.[entryId];
	if (!entry) {
		return err("Entry not found");
	}
	return when(makeComment({ content }), {
		ok: (data) => {
			entry.comments.push(data);
			store.set({ [entryId]: entry });
			return ok();
		},
		err: (error) => err(`Validation error: ${error}`),
	});
};

export const createEntryService = (
	entryStore: PersistentStore<Record<string, Entry>>,
) => {
	const loadPromise = entryStore.load();

	return {
		getEntries: async () => {
			await loadPromise;
			const entries = getEntries(entryStore);
			return entries;
		},
		createEntry: (content: string) => createEntry(entryStore, content),
		createComment: async (entryId: string, content: string) => {
			await loadPromise;
			return createComment(entryStore, entryId, content);
		},
	};
};
