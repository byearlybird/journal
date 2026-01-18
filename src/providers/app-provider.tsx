import { createPerister, store } from "@app/store";
import { useEffect, useState } from "react";

interface AppProviderProps {
  loadingComponent: React.ReactNode;
  errorComponent: React.ReactNode;
  children: React.ReactNode;
}

const persister = createPerister(store, "notes");

export function AppProvider({ loadingComponent, errorComponent, children }: AppProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initPromise] = useState(() => persister.load());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initPromise
      .catch((error) => {
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

  return children;
}
