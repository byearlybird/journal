import { useStore } from "@nanostores/react";
import { isToday } from "date-fns";
import { store } from ".";

export const useNotes = () =>
	useStore(
		store.query(["notes"], ({ notes }) =>
			Array.from(notes.values()).sort(
				(a, b) =>
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
			),
		),
	);

export const useTodayNotes = () =>
	useStore(
		store.query(["notes"], ({ notes }) =>
			Array.from(notes.values()).filter((note) => isToday(note.createdAt)),
		),
	);
