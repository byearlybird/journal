import { useEffect } from "react";
import { sync } from "./client";

// TODO: Replace with actual auth system
// For now, we assume the user is always signed in
const useSession = () => ({ isSignedIn: true });

export function useSyncOnSignin() {
  const { isSignedIn } = useSession();

  useEffect(() => {
    if (!isSignedIn) return;

    sync().then((result) => {
      if (!result.ok) {
        console.error("Sync failed:", result.error);
      }
    });
  }, [isSignedIn]);
}
