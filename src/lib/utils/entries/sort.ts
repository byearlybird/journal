/**
 * Comparator function for sorting items by createdAt in descending order (newest first)
 */
export const sortByCreatedAtDesc = <T extends { createdAt: string }>(
	a: T,
	b: T,
): number => {
	return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
};
