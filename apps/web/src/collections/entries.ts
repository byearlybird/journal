import { createSystemClock } from "@journal/crdt/clock";
import { createIdbPersister } from "@journal/crdt/persistence/web";
import { createStore, withPersistence } from "@journal/crdt/store";

export type Comment = {
	id: string;
	content: string;
	createdAt: string;
};

export type Entry = {
	$id: string;
	content: string;
	date: string;
	isBookmarked: boolean;
	comments: Comment[];
	createdAt: string;
};

export type CreateEntryInput = {
	content: string;
	date: string;
};

export const entry = (data: CreateEntryInput): Entry => ({
	...data,
	$id: crypto.randomUUID(),
	comments: [],
	createdAt: new Date().toISOString(),
	isBookmarked: false,
});

export const getDeviceId = () => {
	const current = localStorage.getItem("deviceId");
	if (current) {
		return current;
	}
	const newId = crypto.randomUUID();
	localStorage.setItem("deviceId", newId);
	return newId;
};

export const persister = createIdbPersister({
	dbName: "journal",
});

const _entryStore = createStore<Record<string, Entry>>({
	defaultState: [],
	clockProvider: createSystemClock(),
});

export const entryStore = withPersistence(_entryStore, {
	key: "entries",
	persistenceProvider: persister,
});
