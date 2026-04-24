import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { $syncState, clearAuth, setAuth, sync } from "@/stores/sync-client";
import { useDBQuery } from "./use-db-query";
import { useStore } from "@nanostores/react";

const SYNC_INTERVAL_MS = 60_000;

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

  useEffect(() => {
    if (client.status !== "unlocked") {
      console.log("locked");
      return;
    }

    const id = setInterval(() => {
      sync().then((result) => {
        if (result.result === "error") {
          console.error("sync error:", result.error);
        } else {
          console.log("ran sync:", result.result);
        }
      });
    }, SYNC_INTERVAL_MS);

    return () => clearInterval(id);
  }, [client.status]);
}

function useSyncAuthStatus() {
  const { isSignedIn, getToken } = useAuth();

  useEffect(() => {
    if (isSignedIn === true) {
      setAuth(getToken);
    } else if (isSignedIn === false) {
      clearAuth();
    }
  }, [isSignedIn, getToken]);

  return {};
}
