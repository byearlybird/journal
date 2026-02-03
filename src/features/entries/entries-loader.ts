import { notesRepo, tasksRepo } from "@app/db";
import { compareDesc, isToday, parseISO } from "date-fns";
import { formatISODate } from "@app/utils/date-utils";
import type { TimelineItem } from "./types";

export async function getEntriesToday(): Promise<TimelineItem[]> {
  const [notes, tasks] = await Promise.all([notesRepo.findAll(), tasksRepo.findAll()]);

  const noteEntries: TimelineItem[] = notes
    .filter((note) => isToday(parseISO(note.created_at)))
    .map((note) => ({
      ...note,
      type: "note" as const,
    }));

  const taskEntries: TimelineItem[] = tasks
    .filter((task) => isToday(parseISO(task.created_at)))
    .map((task) => ({
      ...task,
      type: "task" as const,
    }));

  return [...noteEntries, ...taskEntries].sort((a, b) =>
    compareDesc(parseISO(a.created_at), parseISO(b.created_at)),
  );
}

export async function getEntriesGroupedByDate(): Promise<Record<string, TimelineItem[]>> {
  const [notes, tasks] = await Promise.all([notesRepo.findAll(), tasksRepo.findAll()]);

  const noteEntries: TimelineItem[] = notes.map((note) => ({
    ...note,
    type: "note" as const,
  }));

  const taskEntries: TimelineItem[] = tasks.map((task) => ({
    ...task,
    type: "task" as const,
  }));

  const allEntries = [...noteEntries, ...taskEntries].sort((a, b) =>
    compareDesc(parseISO(a.created_at), parseISO(b.created_at)),
  );

  const grouped: Record<string, TimelineItem[]> = {};
  for (const entry of allEntries) {
    const date = formatISODate(parseISO(entry.created_at));
    grouped[date] ??= [];
    grouped[date].push(entry);
  }
  return grouped;
}
