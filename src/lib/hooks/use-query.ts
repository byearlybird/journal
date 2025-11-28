import { useEffect, useState } from "react";
import { db } from "../db/db";

type QueryFn<T> = Parameters<typeof db.query<T>>[0];

// Prevents a type from being used in type inference
type NoInfer<T> = [T][T extends unknown ? 0 : never];

/**
 * Creates a reactive query that automatically re-runs when dependencies change.
 * Manages query lifecycle (subscription and disposal) automatically.
 *
 * IMPORTANT: The queryFn parameter must be stable (memoized with useMemo) to prevent
 * infinite re-renders. If the query function changes on every render, it will cause
 * the effect to re-run continuously.
 *
 * @param queryFn - Query function that receives a transaction and returns a result (must be memoized!)
 * @param initialValue - Optional initial value (when provided, removes undefined from return type)
 * @returns The query result
 *
 * @example
 * ```ts
 * // With initial value (type is Entry[] - no undefined!)
 * const queryFn = useMemo(() => (tx) => tx.entries.getAll(), []);
 * const entries = useQuery(queryFn, []);
 * entries.forEach(entry => console.log(entry));
 *
 * // Without initial value (type is Entry[] | undefined)
 * const queryFn = useMemo(() => (tx) => tx.entries.getAll(), []);
 * const entries = useQuery(queryFn);
 * if (entries) {
 *   entries.forEach(entry => console.log(entry));
 * }
 * ```
 */
export function useQuery<T>(queryFn: QueryFn<T>, initialValue: NoInfer<T>): T;
export function useQuery<T>(queryFn: QueryFn<T>): T | undefined;
export function useQuery<T>(
	queryFn: QueryFn<T>,
	initialValue?: NoInfer<T>,
): T | undefined {
	const [data, setData] = useState<T | undefined>(initialValue);

	useEffect(() => {
		const query = db.query(queryFn);

		setData(query.result);

		const unsubscribe = query.subscribe((results) => {
			setData(results);
		});

		return () => {
			unsubscribe();
			query.dispose();
		};
	}, [queryFn]);

	return data;
}
