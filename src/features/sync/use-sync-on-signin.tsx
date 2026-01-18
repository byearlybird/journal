import { useSession } from "@clerk/clerk-react";
import { useEffect } from "react";
import { sync } from "./client";

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
