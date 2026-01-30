import { useSession } from "@clerk/clerk-react";
import { store } from "@app/store";
import { useEffect } from "react";
import { getIsSyncing, sync } from "./client";

export function useSyncOnMutate() {
  const { isSignedIn } = useSession();

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      // Skip if already syncing to prevent infinite loop
      if (getIsSyncing()) {
        return;
      }

      if (!navigator.onLine || !isSignedIn) return;

      sync().then((result) => {
        if (!result.ok) {
          console.error("Sync failed:", result.error);
        }
      });
    });

    return unsubscribe;
  }, [isSignedIn]);
}
