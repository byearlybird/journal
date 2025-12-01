import { isSameDay } from "date-fns";
import { useMemo } from "react";
import { useQuery } from "@/lib/hooks/use-query";
import {
	combineEntriesWithComments,
	sortByCreatedAtDesc,
} from "@/lib/utils/entries";

/**
 * Hook to fetch entries with their comments.
 * Uses reactive query pattern - automatically updates when entries or comments change.
 * @param date Optional ISO date string to filter entries by. If omitted, returns all entries.
 */
export const useEntriesQuery = (date?: string) => {
	// Memoize query function to prevent infinite re-renders
	const queryFn = useMemo(
		() => (tx) => {
			const entries = tx.entries.find(
				(entry) =>
					date ? isSameDay(new Date(entry.createdAt), new Date(date)) : true,
				{ sort: sortByCreatedAtDesc },
			);
			const allComments = tx.comments.getAll().sort(sortByCreatedAtDesc);
			return combineEntriesWithComments(entries, allComments);
		},
		[date],
	);

	const entries = useQuery(queryFn, []);

	return entries;
};
