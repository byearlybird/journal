import type { Comment, Entry, Note, Task } from "@/lib/db";

export type EntryWithComments = Entry & { comments: Comment[] };

/**
 * Combines entries (notes and tasks) with their associated comments.
 * Groups comments by entryId and attaches them to their respective entries.
 * Comments are sorted by createdAt descending (newest first).
 *
 * @param notes Array of notes
 * @param tasks Array of tasks
 * @param allComments Array of all comments
 * @returns Array of entries with their comments attached, sorted by createdAt descending
 */
export const combineEntriesWithComments = (
	notes: Note[],
	tasks: Task[],
	allComments: Comment[],
): EntryWithComments[] => {
	// Group comments by entryId
	const commentsByEntry = allComments.reduce((acc, comment) => {
		const existing = acc.get(comment.entryId) ?? [];
		return acc.set(comment.entryId, [...existing, comment]);
	}, new Map<string, Comment[]>());

	// Combine notes and tasks with their comments
	const notesWithComments: EntryWithComments[] = notes.map((note) => ({
		...note,
		type: "note" as const,
		comments: commentsByEntry.get(note.id) ?? [],
	}));

	const tasksWithComments: EntryWithComments[] = tasks.map((task) => ({
		...task,
		type: "task" as const,
		comments: commentsByEntry.get(task.id) ?? [],
	}));

	// Merge and sort by createdAt descending
	return [...notesWithComments, ...tasksWithComments].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
};
