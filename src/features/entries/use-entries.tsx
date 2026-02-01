import { notesRepo, tasksRepo } from "@app/db";
import { useQuery } from "@tanstack/react-query";
import { compareDesc, format, isToday, parseISO } from "date-fns";
import type { Entry } from "./types";

const ENTRIES_QUERY_KEY = ["entries"];

export function useEntriesGroupedByDate() {
  return useQuery({
    queryKey: ENTRIES_QUERY_KEY,
    queryFn: async (): Promise<Record<string, Entry[]>> => {
      const [notes, tasks] = await Promise.all([notesRepo.findAll(), tasksRepo.findAll()]);

      // Get all notes and add type discriminator
      const noteEntries: Entry[] = notes.map((note) => ({
        ...note,
        type: "note" as const,
      }));

      // Get all tasks and add type discriminator
      const taskEntries: Entry[] = tasks.map((task) => ({
        ...task,
        type: "task" as const,
      }));

      // Combine and sort by created_at descending
      const allEntries = [...noteEntries, ...taskEntries].sort((a, b) =>
        compareDesc(parseISO(a.created_at), parseISO(b.created_at)),
      );

      // Group by date
      const grouped: Record<string, Entry[]> = {};
      for (const entry of allEntries) {
        const date = format(parseISO(entry.created_at), "yyyy-MM-dd");
        grouped[date] ??= [];
        grouped[date].push(entry);
      }
      return grouped;
    },
  });
}

export function useEntriesToday() {
  return useQuery({
    queryKey: [...ENTRIES_QUERY_KEY, "today"],
    queryFn: async (): Promise<Entry[]> => {
      const [notes, tasks] = await Promise.all([notesRepo.findAll(), tasksRepo.findAll()]);

      // Get today's notes
      const noteEntries: Entry[] = notes
        .filter((note) => isToday(parseISO(note.created_at)))
        .map((note) => ({
          ...note,
          type: "note" as const,
        }));

      // Get today's tasks
      const taskEntries: Entry[] = tasks
        .filter((task) => isToday(parseISO(task.created_at)))
        .map((task) => ({
          ...task,
          type: "task" as const,
        }));

      // Combine and sort by created_at descending
      return [...noteEntries, ...taskEntries].sort((a, b) =>
        compareDesc(parseISO(a.created_at), parseISO(b.created_at)),
      );
    },
  });
}
