import { SQL } from "bun";
import type { PersistenceProvider } from "../types";

const init = async (db: SQL) => {
	await db`
    CREATE TABLE IF NOT EXISTS keyval (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `;
};

const get = async <T>(db: SQL, key: string): Promise<T | null> => {
	const results = await db`
    SELECT value FROM keyval WHERE key = ${key}
  `;
	const row = results[0];
	return row ? (JSON.parse(row.value) as T) : null;
};

const set = async <T>(db: SQL, key: string, value: T): Promise<void> => {
	await db`
    INSERT INTO keyval (key, value) VALUES (${key}, ${JSON.stringify(value)})
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `;
};

export const createBunPersister = (
	{ dbPath } = {
		dbPath: ":memory:",
	},
): PersistenceProvider => {
	const dbPromise = (async () => {
		const sqlite = new SQL(dbPath);
		await init(sqlite);
		return sqlite;
	})();

	return {
		get: async <T>(key: string) => {
			const db = await dbPromise;
			const result = await get<T>(db, key);
			return result;
		},
		set: async <T>(key: string, data: T) => {
			const db = await dbPromise;
			await set(db, key, data);
		},
	};
};
