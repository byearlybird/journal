import { store } from "@app/store";
import { compareDesc, format, isToday, parseISO } from "date-fns";
import { createStoreSelector } from "@app/utils/store-selectors";
import type { Entry } from "./types";

export const useEntriesGroupedByDate = createStoreSelector(
  ["notes", "tasks"],
  (): Record<string, Entry[]> => {
    // Get all notes and add type discriminator
    const noteEntries: Entry[] = store.list("notes").map((note) => ({
      ...note,
      type: "note" as const,
    }));

    // Get all tasks and add type discriminator
    const taskEntries: Entry[] = store.list("tasks").map((task) => ({
      ...task,
      type: "task" as const,
    }));

    // Combine and sort by createdAt descending
    const allEntries = [...noteEntries, ...taskEntries].sort((a, b) =>
      compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)),
    );

    // Group by date
    const grouped: Record<string, Entry[]> = {};
    for (const entry of allEntries) {
      const date = format(parseISO(entry.createdAt), "yyyy-MM-dd");
      grouped[date] ??= [];
      grouped[date].push(entry);
    }
    return grouped;
  },
);

export const useEntriesToday = createStoreSelector(["notes", "tasks"], (): Entry[] => {
  // Get today's notes
  const noteEntries: Entry[] = store
    .list("notes", { where: (note) => isToday(parseISO(note.createdAt)) })
    .map((note) => ({
      ...note,
      type: "note",
    }));

  // Get today's tasks
  const taskEntries: Entry[] = store
    .list("tasks", { where: (task) => isToday(parseISO(task.createdAt)) })
    .map((task) => ({
      ...task,
      type: "task",
    }));

  // Combine and sort by createdAt descending
  return [...noteEntries, ...taskEntries].sort((a, b) =>
    compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)),
  );
});
