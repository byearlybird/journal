import { migrator } from "@app/db/migrator";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

// Create a QueryClient instance
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: async () => {
      // Invalidate all queries on any mutation.
      // Because all data is local, it's inexpensive to re-fetch.
      queryClient.invalidateQueries();
    },
  }),
});

interface AppProviderProps {
  loadingComponent: React.ReactNode;
  errorComponent: React.ReactNode;
  children: React.ReactNode;
}

// TODO: Create Context to contain DB and/or Services for dependency injection.
export function AppProvider({ loadingComponent, errorComponent, children }: AppProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const runMigrations = async () => {
      try {
        await migrator.migrateToLatest();
        setIsInitializing(false);
      } catch (err) {
        const migrationError = err instanceof Error ? err : new Error(String(err));

        setError(migrationError);
      }
    };

    runMigrations();
  }, []);

  if (error) {
    return errorComponent;
  }

  if (isInitializing) {
    return loadingComponent;
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
