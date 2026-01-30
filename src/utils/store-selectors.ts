import { useSyncExternalStore } from "react";
import { store } from "@app/store";

/**
 * Creates a memoized selector for store data that only updates when specified collections change.
 *
 * @param collections - Single collection name or array of collection names to watch
 * @param selector - Function that computes the derived value from the store
 * @returns Hook that subscribes to store changes and returns the memoized value
 */
export function createStoreSelector<T>(collections: string | string[], selector: () => T) {
  let version = 0;
  let cachedVersion = -1;
  let cached = selector();

  const collectionSet = new Set(Array.isArray(collections) ? collections : [collections]);

  store.subscribe((e) => {
    const dirtyCollections = new Set<string>(Object.keys(e));
    const matches = collectionSet.intersection(dirtyCollections);
    if (matches.size > 0) {
      version++;
    }
  });

  const subscribe = (callback: () => void) => store.subscribe(callback);

  const getSnapshot = () => {
    if (version !== cachedVersion) {
      cachedVersion = version;
      cached = selector();
    }
    return cached;
  };

  return () => useSyncExternalStore(subscribe, getSnapshot);
}
