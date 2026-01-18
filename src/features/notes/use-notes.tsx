import { useSyncExternalStore, useCallback } from "react";
import { store, type Note, type NewNote } from "@app/store";
import { compareDesc, format, isToday, parseISO } from "date-fns";

// Track store version for memoization
let storeVersion = 0;
store.onChange(() => {
  storeVersion++;
});

const subscribe = (callback: () => void) => store.onChange(callback);

// Memoize getSnapshot results to avoid infinite loops
function createMemoizedSelector<T>(selector: () => T) {
  let cachedVersion = storeVersion;
  let cachedResult = selector();

  return () => {
    if (storeVersion !== cachedVersion) {
      cachedVersion = storeVersion;
      cachedResult = selector();
    }
    return cachedResult;
  };
}

const getNotesGroupedByDate = createMemoizedSelector((): Record<string, Note[]> => {
  const notes = store
    .getAll("notes")
    .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));

  const grouped: Record<string, Note[]> = {};
  for (const note of notes) {
    const date = format(parseISO(note.createdAt), "yyyy-MM-dd");
    grouped[date] ??= [];
    grouped[date].push(note);
  }
  return grouped;
});

const getNotesToday = createMemoizedSelector((): Note[] => {
  return store
    .getAll("notes", { where: (note) => isToday(parseISO(note.createdAt)) })
    .sort((a, b) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));
});

export function useNotesGroupedByDate() {
  return useSyncExternalStore(subscribe, getNotesGroupedByDate);
}

export function useNotesToday() {
  return useSyncExternalStore(subscribe, getNotesToday);
}

export function useCreateNote() {
  const createNote = useCallback((note: Pick<NewNote, "content">) => {
    store.add("notes", note);
  }, []);

  return { mutate: createNote };
}
