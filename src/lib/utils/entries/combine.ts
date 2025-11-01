import type { Comment, Entry } from "@/lib/db";

type EntryWithComments = Entry & { comments: Comment[] };

/**
 * Combines entries with their associated comments.
 * Groups comments by entryId and attaches them to their respective entries.
 * Comments are sorted by createdAt descending (newest first).
 *
 * @param entries Array of entries
 * @param allComments Array of all comments
 * @returns Array of entries with their comments attached
 */
export const combineEntriesWithComments = (
	entries: Entry[],
	allComments: Comment[],
): EntryWithComments[] => {
	// Group comments by entryId
	const commentsByEntry = allComments.reduce((acc, comment) => {
		const existing = acc.get(comment.entryId) ?? [];
		return acc.set(comment.entryId, [...existing, comment]);
	}, new Map<string, Comment[]>());

	// Combine entries with their sorted comments
	return entries.map((entry) => ({
		...entry,
		comments: commentsByEntry.get(entry.id) ?? [],
	}));
};
