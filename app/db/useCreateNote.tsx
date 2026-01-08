import { useMutation } from "@tanstack/react-query";
import { useCallback } from "react";
import { ulid } from "ulid";
import type { NewNote } from "./db";
import { useDb } from "./db-provider";

export function useCreateNote() {
	const { db } = useDb();

	const createNote = useCallback(
		async (newNote: Pick<NewNote, "content">) => {
			return db
				.insertInto("note")
				.values({
					id: crypto.randomUUID(),
					content: newNote.content,
					eventstamp: ulid(),
					tombstone: 0,
					created_at: new Date().toISOString(),
				})
				.execute();
		},
		[db],
	);

	return useMutation({
		mutationFn: createNote,
	});
}
