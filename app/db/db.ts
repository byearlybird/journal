import {
	type ColumnType,
	type Insertable,
	Kysely,
	type Selectable,
	type Updateable,
} from "kysely";
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

export type Database = {
	note: NoteTable;
};

export const client = new SQLocalKysely("database.sqlite3");

export const db = new Kysely<Database>({ dialect: client.dialect });

export type Db = typeof db;
