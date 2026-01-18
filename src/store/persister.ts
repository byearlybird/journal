import * as kv from "idb-keyval";
import type { StoreSnapshot } from "@byearlybird/starling";
import type { store } from "./store";

export const createPerister = (persistedStore: typeof store, name: string) => {
  let loaded = false;
  const unsub = persistedStore.onChange(async () => {
    if (!loaded) return;
    const state = persistedStore.getSnapshot();
    await kv.set(name, JSON.stringify(state));
  });

  const load = async () => {
    const value = await kv.get(name);

    if (value) {
      const parsed: StoreSnapshot = JSON.parse(value);
      persistedStore.merge(parsed);
    }

    loaded = true;
  };

  return {
    load,
    unsubscribe: unsub,
  };
};
