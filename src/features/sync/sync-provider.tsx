import type { ReactNode } from "react";
import { useSyncOnInterval } from "./use-sync-on-interval";

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  useSyncOnInterval();

  return <>{children}</>;
}
