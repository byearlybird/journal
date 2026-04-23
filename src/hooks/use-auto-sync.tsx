import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { $syncState, clearAuth, setAuth, sync } from "@/stores/sync-client";
import { useDBQuery } from "./use-db-query";
import { useStore } from "@nanostores/react";

export function useAutoSync() {
  useSyncAuthStatus();
  const changes = useDBQuery((db) => db.selectFrom("sync_changes").selectAll());
  const client = useStore($syncState);

  useEffect(() => {
    if (client.status !== "unlocked") {
      return;
    }

    sync();
  }, [changes, client.status]);
}

function useSyncAuthStatus() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      setAuth(getToken);
    } else {
      clearAuth();
    }
  }, [isSignedIn, getToken]);

  return {};
}
