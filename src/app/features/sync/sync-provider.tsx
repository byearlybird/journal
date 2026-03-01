import { type ReactNode, createContext, useCallback, useContext, useEffect } from "react";
import { useSession } from "@clerk/clerk-react";
import { useLocalStorage } from "@/app/hooks/use-local-storage";
import { invalidateData } from "@/app/stores/data-version";
import { syncDatabase } from "./client";

interface SyncContextValue {
  lastSyncedAt: number | null;
  sync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue>({ lastSyncedAt: null, sync: async () => {} });

export function useSyncContext() {
  return useContext(SyncContext);
}

interface SyncProviderProps {
  children: ReactNode;
}

const SYNC_INTERVAL = 60000 * 5; // 5 minutes

export function SyncProvider({ children }: SyncProviderProps) {
  const { isSignedIn, session } = useSession();
  const [lastSyncedAt, setLastSyncedAt] = useLocalStorage<number | null>("lastSyncedAt", null);

  const sync = useCallback(async () => {
    const token = await session?.getToken();
    if (!token) return;

    await syncDatabase(token);
    setLastSyncedAt(Date.now());
  }, [session]);

  useEffect(() => {
    if (!isSignedIn) return;

    sync().then(() => {
      invalidateData();
    });

    const interval = setInterval(() => {
      sync().then(() => {
        invalidateData();
      });
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isSignedIn, sync]);

  return <SyncContext value={{ lastSyncedAt, sync }}>{children}</SyncContext>;
}
