import { useMemo } from "react";
import { useQuery } from "@/lib/hooks/use-query";
import { sortByCreatedAtDesc } from "@/lib/utils/entries";

export const useCommentQuery = (entryId: string) => {
	// Memoize query function to prevent infinite re-renders
	const queryFn = useMemo(
		() => (tx) =>
			tx.comments.find((comment) => comment.entryId === entryId, {
				sort: sortByCreatedAtDesc,
			}),
		[entryId],
	);

	const comments = useQuery(queryFn, []);

	return comments;
};
