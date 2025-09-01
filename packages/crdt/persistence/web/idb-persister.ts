import type { PersistenceProvider } from "../types";

const openDB = (dbName: string): Promise<IDBDatabase> => {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(dbName, 1);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains("keyval")) {
				db.createObjectStore("keyval");
			}
		};
	});
};

const get = <T>(db: IDBDatabase, key: string): Promise<T | null> => {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction("keyval", "readonly");
		const store = transaction.objectStore("keyval");
		const request = store.get(key);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve(request.result);
	});
};

const set = <T>(db: IDBDatabase, key: string, value: T): Promise<void> => {
	return new Promise((resolve, reject) => {
		const transaction = db.transaction("keyval", "readwrite");
		const store = transaction.objectStore("keyval");
		const request = store.put(value, key);
		request.onerror = () => reject(request.error);
		request.onsuccess = () => resolve();
	});
};

type IdbPersisterOptions = {
	dbName: string;
};

export const createIdbPersister = ({
	dbName,
}: IdbPersisterOptions): PersistenceProvider => {
	const dbPromise = openDB(dbName);

	return {
		get: async <T>(key: string) => {
			const db = await dbPromise;
			return get<T>(db, key);
		},
		set: async <T>(key: string, data: T) => {
			const db = await dbPromise;
			return set<T>(db, key, data);
		},
	};
};
