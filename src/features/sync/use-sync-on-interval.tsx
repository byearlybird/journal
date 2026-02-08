import { useEffect, useRef } from "react";
import { sync } from "./client";

const POLL_REMOTE_INTERVAL_MS = 10000; // 10 seconds

// TODO: Replace with actual auth system
// For now, we assume the user is always signed in
const useSession = () => ({ isSignedIn: true });

export function useSyncOnInterval() {
  const { isSignedIn } = useSession();
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
      sync().then((result) => {
        if (!result.ok) {
          console.error("Sync failed:", result.error);
        }
      });
    }, POLL_REMOTE_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isSignedIn]);
}
