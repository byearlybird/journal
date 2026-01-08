import { migrator } from "@app/db/migrator";
import {
	MutationCache,
	QueryClient,
	QueryClientProvider,
} from "@tanstack/react-query";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { type Db, db } from "./db";
import { advanceClock, makeStamp } from "./clock";

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
	getEventstamp: () => Promise<string>;
} | null>(null);

export function useDb() {
	const context = useContext(DbContext);
	if (!context) {
		throw new Error("useDb must be used within a DbProvider");
	}
	return context;
}

export function DbProvider({ loading, children }: DbProviderProps) {
	const [isMigrated, setIsMigrated] = useState(false);
	const [timestamp, setTimestamp] = useState<number | null>(null);
	const [sequence, setSequence] = useState<number | null>(null);

	const isLoading = useMemo(
		() => isMigrated && timestamp !== null && sequence !== null,
		[isMigrated, timestamp, sequence],
	);

	useEffect(() => {
		const runMigrations = async () => {
			try {
				await migrator.migrateToLatest();
				setIsMigrated(false);
			} catch (err) {
				const migrationError =
					err instanceof Error ? err : new Error(String(err));

				throw migrationError;
			}
		};

		const loadClock = async () => {
			const timestamp = await db
				.selectFrom("sync_meta")
				.select("value")
				.where("key", "=", "clock_timestamp")
				.executeTakeFirstOrThrow();

			const sequence = await db
				.selectFrom("sync_meta")
				.select("value")
				.where("key", "=", "clock_sequence")
				.executeTakeFirstOrThrow();

			setTimestamp(timestamp.value);
			setSequence(sequence.value);
		};

		const init = async () => {
			await runMigrations();
			await loadClock();
		};

		init();
	}, []);

	const getEventstamp = useCallback(async () => {
		if (timestamp === null || sequence === null) {
			throw new Error("Timestamp not loaded");
		}

		const next = advanceClock(
			{ ms: timestamp, seq: sequence },
			{ ms: Date.now(), seq: sequence },
		);

		await db.transaction().execute(async (tx) => {
			await tx
				.updateTable("sync_meta")
				.set({ value: next.ms })
				.where("key", "=", "clock_timestamp")
				.execute();
			await tx
				.updateTable("sync_meta")
				.set({ value: next.seq })
				.where("key", "=", "clock_sequence")
				.execute();

			setTimestamp(next.ms);
			setSequence(next.seq);
		});

		return makeStamp(next.ms, next.seq);
	}, [timestamp, sequence]);

	return (
		<DbContext.Provider value={{ db, getEventstamp }}>
			<QueryClientProvider client={queryClient}>
				{isLoading ? loading : children}
			</QueryClientProvider>
		</DbContext.Provider>
	);
}
