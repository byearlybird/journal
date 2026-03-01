import { type ReactNode, createContext, useCallback, useContext, useEffect } from "react";
import { useSession } from "@clerk/clerk-react";
import { useLocalStorage } from "@app/hooks/use-local-storage";
import { syncDatabase } from "./client";
import { useRouter } from "@tanstack/react-router";

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
  const router = useRouter();
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
      router.invalidate();
    });

    const interval = setInterval(() => {
      sync().then(() => {
        router.invalidate();
      });
    }, SYNC_INTERVAL);

    return () => clearInterval(interval);
  }, [isSignedIn, sync, router]);

  return <SyncContext value={{ lastSyncedAt, sync }}>{children}</SyncContext>;
}
