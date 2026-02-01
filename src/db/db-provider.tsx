import { migrator } from "@app/db";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});

interface DatabaseProviderProps {
  loadingComponent: React.ReactNode;
  errorComponent: React.ReactNode;
  children: ReactNode;
}

export function DatabaseProvider({
  loadingComponent,
  errorComponent,
  children,
}: DatabaseProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    migrator
      .migrateToLatest()
      .then((result) => {
        console.log("Migrations complete:", result);
      })
      .catch((error) => {
        console.error("Migration error:", error);
        setError(error);
      })
      .finally(() => {
        setIsInitializing(false);
      });
  }, []);

  if (error) {
    return errorComponent;
  }

  if (isInitializing) {
    return loadingComponent;
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
