import { useQuery } from "@tanstack/react-query";
import { format, parse, parseISO } from "date-fns";
import type { Note } from "./db";
import { useDb } from "./db-provider";

export type DateNotesGroup = {
	date: string;
	notes: Note[];
};

export function useAllNotes() {
	const { db } = useDb();

	return useQuery({
		queryKey: ["notes", "list"],
		queryFn: () =>
			db.selectFrom("note").orderBy("created_at", "desc").selectAll().execute(),
		select: (result): DateNotesGroup[] => {
			const grouped: Record<string, Note[]> = {};
			for (const note of result) {
				const noteDate = parseISO(note.created_at);
				const date = format(noteDate, "yyyy-MM-dd");
				if (!grouped[date]) {
					grouped[date] = [];
				}
				grouped[date].push(note);
			}

			// Convert to array and sort by date (newest first)
			const sortedDates = Object.keys(grouped).sort((a, b) => {
				const dateA = parse(a, "yyyy-MM-dd", new Date());
				const dateB = parse(b, "yyyy-MM-dd", new Date());
				return dateB.getTime() - dateA.getTime();
			});

			return sortedDates.map((date) => ({
				date,
				notes: grouped[date],
			}));
		},
	});
}
