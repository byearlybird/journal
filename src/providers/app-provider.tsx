import { migrator } from "@app/db/migrator";
import {
	MutationCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState } from "react";
import { type Db, db } from "../db/db";

// Create a QueryClient instance
const queryClient = new QueryClient({
	mutationCache: new MutationCache({
		onSuccess: async () => {
			// Invalidate all queries on any mutation. Should be fine because its all local data, inexpensive to re-fetch.
			queryClient.invalidateQueries();
		},
	}),
});

interface AppProviderProps {
	loading: React.ReactNode;
	children: React.ReactNode;
}

const AppContext = createContext<{
	db: Db;
} | null>(null);

export function useApp() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useApp must be used within a AppProvider");
	}
	return context;
}

export function AppProvider({ loading, children }: AppProviderProps) {
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		const runMigrations = async () => {
			try {
				await migrator.migrateToLatest();
				setIsInitializing(false);
			} catch (err) {
				const migrationError =
					err instanceof Error ? err : new Error(String(err));

				throw migrationError;
			}
		};

		runMigrations();
	}, []);

	return (
		<AppContext.Provider value={{ db }}>
			<QueryClientProvider client={queryClient}>
				{isInitializing ? loading : children}
			</QueryClientProvider>
		</AppContext.Provider>
	);
}
