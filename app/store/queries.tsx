import { useStore } from "@nanostores/react";
import { format, isToday, parse, parseISO } from "date-fns";
import { type Note, store } from ".";

export const useTodayNotes = () =>
	useStore(
		store.query(["notes"], ({ notes }) =>
			Array.from(notes.values())
				.filter((note) => isToday(parseISO(note.createdAt)))
				.sort(
					(a, b) =>
						parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime(),
				),
		),
	);

export type DateNotes = {
	[date: string]: Note[];
};

export const useAllNotes = (): DateNotes =>
	useStore(
		store.query(["notes"], ({ notes }) => {
			// Collect and sort all notes once by createdAt descending (newest first)
			const allNotes = Array.from(notes.values());
			allNotes.sort(
				(a, b) =>
					parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime(),
			);

			// Group sorted notes by local date (order preserved within each date group)
			const grouped: DateNotes = {};
			for (const note of allNotes) {
				const noteDate = parseISO(note.createdAt);
				const date = format(noteDate, "yyyy-MM-dd");
				if (!grouped[date]) {
					grouped[date] = [];
				}
				grouped[date].push(note);
			}

			// Sort date keys (newest first) and build final object
			const sortedDates = Object.keys(grouped).sort((a, b) => {
				const dateA = parse(a, "yyyy-MM-dd", new Date());
				const dateB = parse(b, "yyyy-MM-dd", new Date());
				return dateB.getTime() - dateA.getTime();
			});
			const sortedGrouped: DateNotes = {};
			for (const date of sortedDates) {
				sortedGrouped[date] = grouped[date];
			}
			return sortedGrouped;
		}),
	);
