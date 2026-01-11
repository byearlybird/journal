import { db, type NewNote, type Note } from "@app/db/db";
import { format, parseISO } from "date-fns";
import { sql } from "kysely";

export const NotesService = {
	getAllGroupedByDate: async () => {
		const notes = await db
			.selectFrom("note")
			.orderBy("created_at", "desc")
			.where("deleted_at", "=", null)
			.selectAll()
			.execute();

		const grouped: Record<string, Note[]> = {};

		for (const note of notes) {
			const noteDate = parseISO(note.created_at);
			const date = format(noteDate, "yyyy-MM-dd");
			if (!grouped[date]) {
				grouped[date] = [];
			}
			grouped[date].push(note);
		}
	},
	getToday: () => {
		return db
			.selectFrom("note")
			.where(sql`DATE(created_at)`, "=", sql`DATE('now')`)
			.where("deleted_at", "=", null)
			.orderBy("created_at", "desc")
			.selectAll()
			.execute();
	},
	create: (note: NewNote) => {
		const now = new Date().toISOString();
		return db
			.insertInto("note")
			.values({
				id: crypto.randomUUID(),
				content: note.content,
				created_at: now,
				updated_at: now,
				deleted_at: null,
			})
			.execute();
	},
};
