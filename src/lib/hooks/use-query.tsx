import { useEffect, useMemo, useState } from "react";
import { db } from "../db/db";

type QueryFn<T> = Parameters<typeof db.query<T>>[0];

/**
 * Creates a reactive query that automatically re-runs when dependencies change.
 * Manages query lifecycle (subscription and disposal) automatically.
 *
 * The query function is memoized internally based on the provided dependency array,
 * so you can pass inline functions without causing infinite re-renders.
 *
 * Since db.query() returns results synchronously, the query result is always available
 * immediately (never undefined). The return type is T, not T | undefined.
 *
 * @param queryFn - Query function that receives a transaction and returns a result
 * @param deps - Dependency array for memoizing the query function
 * @returns The query result (always T, never undefined)
 *
 * @example
 * ```ts
 * // Basic usage - returns Entry[] (no undefined!)
 * const entries = useQuery((tx) => tx.entries.getAll(), []);
 * entries.forEach(entry => console.log(entry));
 *
 * // With dynamic dependencies
 * const entryId = "some-id";
 * const comments = useQuery(
 *   (tx) => tx.comments.where({ entryId }).getAll(),
 *   [entryId]
 * );
 *
 * // If your query returns an empty array, that's still a valid T (not undefined)
 * const filtered = useQuery((tx) => tx.entries.where({ tag: "work" }).getAll(), []);
 * console.log(filtered.length); // 0 is valid, no need to check for undefined
 * ```
 */
export function useQuery<T>(queryFn: QueryFn<T>, deps: unknown[]): T {
	// Memoize the query function based on the provided dependencies
	// biome-ignore lint/correctness/useExhaustiveDependencies: deps is the user-provided dependency array
	const memoizedQueryFn = useMemo(() => queryFn, deps);

	// Memoize the query itself so it persists across renders
	const query = useMemo(() => db.query(memoizedQueryFn), [memoizedQueryFn]);

	// Initialize state with the synchronously available result
	const [data, setData] = useState<T>(query.result);

	useEffect(() => {
		// Sync state with current query result
		setData(query.result);

		// Subscribe to future updates
		const unsubscribe = query.subscribe((results) => {
			setData(results);
		});

		return () => {
			unsubscribe();
			query.dispose();
		};
	}, [query]);

	return data;
}
