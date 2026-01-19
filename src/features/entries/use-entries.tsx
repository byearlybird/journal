import { useSyncExternalStore } from "react";
import { store } from "@app/store";
import { compareDesc, format, isToday, parseISO } from "date-fns";
import type { Entry } from "./types";

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

const getEntriesGroupedByDate = createMemoizedSelector((): Record<string, Entry[]> => {
  // Get all notes and add type discriminator
  const noteEntries: Entry[] = store.getAll("notes").map((note) => ({
    ...note,
    type: "note" as const,
  }));

  // Get all tasks and add type discriminator
  const taskEntries: Entry[] = store.getAll("tasks").map((task) => ({
    ...task,
    type: "task" as const,
  }));

  // Combine and sort by createdAt descending
  const allEntries = [...noteEntries, ...taskEntries].sort((a, b) =>
    compareDesc(parseISO(a.createdAt), parseISO(b.createdAt))
  );

  // Group by date
  const grouped: Record<string, Entry[]> = {};
  for (const entry of allEntries) {
    const date = format(parseISO(entry.createdAt), "yyyy-MM-dd");
    grouped[date] ??= [];
    grouped[date].push(entry);
  }
  return grouped;
});

const getEntriesToday = createMemoizedSelector((): Entry[] => {
  // Get today's notes
  const noteEntries: Entry[] = store
    .getAll("notes", { where: (note) => isToday(parseISO(note.createdAt)) })
    .map((note) => ({
      ...note,
      type: "note" as const,
    }));

  // Get today's tasks
  const taskEntries: Entry[] = store
    .getAll("tasks", { where: (task) => isToday(parseISO(task.createdAt)) })
    .map((task) => ({
      ...task,
      type: "task" as const,
    }));

  // Combine and sort by createdAt descending
  return [...noteEntries, ...taskEntries].sort((a, b) =>
    compareDesc(parseISO(a.createdAt), parseISO(b.createdAt))
  );
});

export function useEntriesGroupedByDate() {
  return useSyncExternalStore(subscribe, getEntriesGroupedByDate);
}

export function useEntriesToday() {
  return useSyncExternalStore(subscribe, getEntriesToday);
}

// Re-export mutation hooks
export { useCreateNote } from "@app/features/notes/use-notes";
export { useCreateTask, useUpdateTaskStatus } from "@app/features/tasks/use-tasks";
