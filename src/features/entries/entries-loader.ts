import { notesRepo, tasksRepo } from "@app/db";
import { getTodayISODate, compareByDatetimeDesc } from "@app/utils/date-utils";
import type { TimelineItem } from "./types";

export async function getEntriesToday(): Promise<TimelineItem[]> {
  const [notes, tasks] = await Promise.all([notesRepo.findAll(), tasksRepo.findAll()]);
  const today = getTodayISODate();

  const noteEntries: TimelineItem[] = notes
    .filter((note) => note.date === today)
    .map((note) => ({
      ...note,
      createdAt: note.createdAt,
      date: note.date,
      type: "note" as const,
    }));

  const taskEntries: TimelineItem[] = tasks
    .filter((task) => task.date === today)
    .map((task) => ({
      ...task,
      createdAt: task.createdAt,
      date: task.date,
      type: "task" as const,
    }));

  return [...noteEntries, ...taskEntries].sort((a, b) =>
    compareByDatetimeDesc(a.createdAt, b.createdAt),
  );
}

export async function getEntriesGroupedByDate(): Promise<Record<string, TimelineItem[]>> {
  const [notes, tasks] = await Promise.all([notesRepo.findAll(), tasksRepo.findAll()]);

  const noteEntries: TimelineItem[] = notes.map((note) => ({
    ...note,
    createdAt: note.createdAt,
    date: note.date,
    type: "note" as const,
  }));

  const taskEntries: TimelineItem[] = tasks.map((task) => ({
    ...task,
    createdAt: task.createdAt,
    date: task.date,
    type: "task" as const,
  }));

  const allEntries = [...noteEntries, ...taskEntries].sort((a, b) =>
    compareByDatetimeDesc(a.createdAt, b.createdAt),
  );

  const grouped: Record<string, TimelineItem[]> = {};
  for (const entry of allEntries) {
    grouped[entry.date] ??= [];
    grouped[entry.date].push(entry);
  }
  return grouped;
}
