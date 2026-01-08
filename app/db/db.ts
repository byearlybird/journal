import {
	type ColumnType,
	type Insertable,
	Kysely,
	type Selectable,
	type Updateable,
} from "kysely";
import type { DatabasePath } from "sqlocal";
import { SQLocalKysely } from "sqlocal/kysely";

// ColumnType<SelectType, InsertType, UpdateType>

type MergableTable = {
	id: ColumnType<string, string, never>;
	eventstamp: string;
	tombstone: ColumnType<0 | 1, 0 | 1, 0 | 1 | undefined>;
};

export type NoteTable = MergableTable & {
	content: string;
	created_at: string;
};

export type Note = Selectable<NoteTable>;
export type NewNote = Insertable<NoteTable>;
export type NoteUpdate = Updateable<NoteTable>;

// runtime insert not allowed, update only
export type SyncMetaTable = {
	key: ColumnType<"clock_timestamp" | "clock_sequence", never, never>;
	value: ColumnType<number, never, number | undefined>;
};

export type Database = {
	sync_meta: SyncMetaTable;
	note: NoteTable;
};

export const createDb = (databasePath: DatabasePath) => {
	const client = new SQLocalKysely(databasePath);
	const db = new Kysely<Database>({ dialect: client.dialect });

	return {
		db,
		client,
	};
};

export const { db, client } = createDb("journal-local.db");

export type Db = typeof db;
