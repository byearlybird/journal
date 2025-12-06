import type { Database, QueryContext, SchemasMap } from "@byearlybird/starling";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export function createDatabaseContext<Schemas extends SchemasMap>(
	database: Database<Schemas>,
) {
	// Create context with null default (provider enforces non-null)
	const DbContext = createContext<Database<Schemas> | null>(null);

	// Provider component that initializes database
	const DbProvider = ({
		children,
		fallback = null,
	}: {
		children: ReactNode;
		fallback?: ReactNode;
	}) => {
		const [dbReady, setDbReady] = useState(false);

		useEffect(() => {
			database.init().then(() => setDbReady(true));
		}, [database]);

		return dbReady ? (
			<DbContext.Provider value={database}>{children}</DbContext.Provider>
		) : (
			fallback
		);
	};

	// Hook to access database instance
	const useDatabase = () => {
		const db = useContext(DbContext);
		if (!db) {
			throw new Error("useDatabase must be used within DbProvider");
		}
		return db;
	};

	// Hook for reactive queries
	const useQuery = <R,>(
		queryFn: (ctx: QueryContext<Schemas>) => R,
		deps: unknown[],
	): R => {
		const db = useDatabase();

		// Memoize query function based on deps
		// biome-ignore lint/correctness/useExhaustiveDependencies: deps is user-provided
		const memoizedQueryFn = useMemo(() => queryFn, deps);

		// Memoize query handle
		const query = useMemo(
			() => db.query(memoizedQueryFn),
			[db, memoizedQueryFn],
		);

		// Initialize state with synchronous result
		const [data, setData] = useState<R>(query.result);

		useEffect(() => {
			// Sync state with current result
			setData(query.result);

			// Subscribe to updates
			const unsubscribe = query.subscribe((results) => {
				setData(results);
			});

			return () => {
				unsubscribe();
				query.dispose();
			};
		}, [query]);

		return data;
	};

	return {
		DbProvider,
		useDatabase,
		useQuery,
	};
}
