import { useSession } from "@clerk/clerk-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { sync } from "./client";

const POLL_REMOTE_INTERVAL_MS = 10000; // 10 seconds

export function useSyncOnInterval() {
  const { isSignedIn } = useSession();
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      sync().then((pullSucceeded) => {
        if (pullSucceeded) {
          queryClient.invalidateQueries();
        }
      });
    }, POLL_REMOTE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSignedIn, queryClient]);
}
