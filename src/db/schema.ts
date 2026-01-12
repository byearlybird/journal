import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";

// ColumnType<SelectType, InsertType, UpdateType>
type MergableTable = {
	id: ColumnType<string, string, never>;
	created_at: string;
	updated_at: string;
	deleted_at: string | null;
};

export type NoteTable = MergableTable & {
	content: string;
};

export type Note = Selectable<NoteTable>;
export type NewNote = Insertable<NoteTable>;
export type NoteUpdate = Updateable<NoteTable>;

export type Database = {
	note: NoteTable;
};
