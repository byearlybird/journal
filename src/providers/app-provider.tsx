import { store } from "@app/store";
import { IdbPersister } from "@byearlybird/starling";
import { useEffect, useState } from "react";

interface AppProviderProps {
  loadingComponent: React.ReactNode;
  errorComponent: React.ReactNode;
  children: React.ReactNode;
}

const persister = new IdbPersister(store, {
  key: "journal",
});

export function AppProvider({ loadingComponent, errorComponent, children }: AppProviderProps) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initPromise] = useState(() => persister.init());
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
