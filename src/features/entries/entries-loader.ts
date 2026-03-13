import { notesRepo, tasksRepo } from "@app/db";
import { compareDesc, isToday, parseISO } from "date-fns";
import { formatISODate } from "@app/utils/date-utils";
import type { TimelineItem } from "./types";

export async function getEntriesToday(): Promise<TimelineItem[]> {
  const [notes, tasks] = await Promise.all([notesRepo.findAll(), tasksRepo.findAll()]);

  const noteEntries: TimelineItem[] = notes
    .filter((note) => isToday(parseISO(note.date)))
    .map((note) => ({
      ...note,
      createdAt: note.createdAt,
      date: note.date,
      type: "note" as const,
    }));

  const taskEntries: TimelineItem[] = tasks
    .filter((task) => isToday(parseISO(task.date)))
    .map((task) => ({
      ...task,
      createdAt: task.createdAt,
      date: task.date,
      type: "task" as const,
    }));

  return [...noteEntries, ...taskEntries].sort((a, b) =>
    compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)),
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
    compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)),
  );

  const grouped: Record<string, TimelineItem[]> = {};
  for (const entry of allEntries) {
    const dateKey = formatISODate(parseISO(entry.date));
    grouped[dateKey] ??= [];
    grouped[dateKey].push(entry);
  }
  return grouped;
}
