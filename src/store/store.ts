import * as kv from "idb-keyval";
import { createStore, type StoreSnapshot } from "@byearlybird/starling";
import { z } from "zod";
import { nanoid } from "nanoid";

const noteSchema = z.object({
  id: z.nanoid().default(() => nanoid()),
  content: z.string(),
  createdAt: z.iso.datetime().default(() => new Date().toISOString()),
  updatedAt: z.iso.datetime().default(() => new Date().toISOString()),
});

export const store = createStore({
  collections: {
    notes: {
      schema: noteSchema,
      keyPath: "id",
    },
  },
});

export type Note = z.infer<typeof noteSchema>;
export type NewNote = z.input<typeof noteSchema>;

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
      store.merge(parsed);
    }

    loaded = true;
  };

  return {
    load,
    unsubscribe: unsub,
  };
};
