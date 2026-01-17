import type { ReactNode } from "react";
import { useSyncOnInterval } from "./use-sync-on-interval";
import { useSyncOnMutate } from "./use-sync-on-mutate";

interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  useSyncOnMutate();
  useSyncOnInterval();

  return <>{children}</>;
}
