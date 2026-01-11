import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import type { NewNote } from "./db";
import { useDb } from "./db-provider";

export function useCreateNote() {
	const { db, getEventstamp } = useDb();

	const createNote = useCallback(
		async (newNote: Pick<NewNote, "content">) => {
			const eventstamp = await getEventstamp();

			return db
				.insertInto("note")
				.values({
					id: crypto.randomUUID(),
					content: newNote.content,
					eventstamp,
					tombstone: 0,
					created_at: new Date().toISOString(),
				})
				.execute();
		},
		[db, getEventstamp],
	);

	return useMutation({
		mutationFn: createNote,
	});
}
