import { isSameDay } from "date-fns";
import { useQuery } from "@/lib/hooks/use-query";
import { combineEntriesWithComments } from "@/lib/utils/entries";

/**
 * Hook to fetch entries (notes and tasks) with their comments.
 * Uses reactive query pattern - automatically updates when entries or comments change.
 * @param date Optional ISO date string to filter entries by. If omitted, returns all entries.
 */
export const useEntriesQuery = (date?: string) => {
	const entries = useQuery(
		(tx) => {
			const dateFilter = (createdAt: string) =>
				date ? isSameDay(new Date(createdAt), new Date(date)) : true;

			const notes = tx.notes.find((note) => dateFilter(note.createdAt));
			const tasks = tx.tasks.find((task) => dateFilter(task.createdAt));
			const allComments = tx.comments.getAll();

			return combineEntriesWithComments(notes, tasks, allComments);
		},
		[date],
	);

	return entries;
};
