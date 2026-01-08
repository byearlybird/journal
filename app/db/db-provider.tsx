import { migrator } from "@app/db/migrator";
import {
	MutationCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { type Db, db } from "./db";

// Create a QueryClient instance
const queryClient = new QueryClient({
	mutationCache: new MutationCache({
		onSuccess: () => {
			// Invalidate all queries on any mutation. Should be fine because its all local data, inexpensive to re-fetch.
			queryClient.invalidateQueries();
		},
	}),
});

interface DbProviderProps {
	loading: React.ReactNode;
	children: React.ReactNode;
}

const DbContext = createContext<{
	db: Db;
} | null>(null);

export function useDb() {
	const context = useContext(DbContext);
	if (!context) {
		throw new Error("useDb must be used within a DbProvider");
	}
	return context;
}

export function DbProvider({ loading, children }: DbProviderProps) {
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const runMigrations = async () => {
			try {
				await migrator.migrateToLatest();
				setIsLoading(false);
			} catch (err) {
				const migrationError =
					err instanceof Error ? err : new Error(String(err));

				throw migrationError;
			}
		};

		runMigrations();
	}, []);

	return (
		<DbContext.Provider value={{ db }}>
			<QueryClientProvider client={queryClient}>
				{isLoading ? loading : children}
			</QueryClientProvider>
		</DbContext.Provider>
	);
}
