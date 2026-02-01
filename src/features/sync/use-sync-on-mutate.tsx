import { useSession } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getIsSyncing, sync } from "./client";

export function useSyncOnMutate() {
  const { isSignedIn } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = queryClient.getMutationCache().subscribe((event) => {
      // Only trigger sync on successful mutations
      if (event.type !== "updated" || event.mutation?.state.status !== "success") {
        return;
      }

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

    return () => unsubscribe();
  }, [isSignedIn, queryClient]);
}
