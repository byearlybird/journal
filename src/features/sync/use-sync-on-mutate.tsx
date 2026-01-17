import { useSession } from "@clerk/clerk-react";
import { store } from "@app/store/store";
import { useEffect } from "react";
import { sync } from "./client";

export function useSyncOnMutate() {
  const { isSignedIn } = useSession();

  useEffect(() => {
    const unsubscribe = store.onChange(() => {
      if (!navigator.onLine || !isSignedIn) return;
      sync();
    });

    return unsubscribe;
  }, [isSignedIn]);
}
