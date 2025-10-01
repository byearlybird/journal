import { useQuery } from "@/lib/db/context";
import { sortByCreatedAtDesc } from "@/lib/utils/entries";

export const useCommentQuery = (entryId: string) => {
	const comments = useQuery(
		(tx) =>
			tx.comments.find((comment) => comment.entryId === entryId, {
				sort: sortByCreatedAtDesc,
			}),
		[entryId],
	);

	return comments;
};
