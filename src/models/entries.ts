import type { EntryRow } from "@/db";
import {
  InvalidEntryTypeError,
  UnknownEntryType,
  type Entry,
  type Intention,
  type Note,
  type Tag,
  type Task,
} from "./types";

export function toNote(row: EntryRow, tags: Tag[] = []): Note {
  if (row.type !== "note") {
    throw new InvalidEntryTypeError("note");
  }

  return {
    id: row.id,
    date: row.date,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    type: "note",
    status: row.status as Note["status"],
    tags,
  };
}

export function toIntention(row: EntryRow): Intention {
  if (row.type !== "intention") {
    throw new InvalidEntryTypeError("intention");
  }

  return {
    id: row.id,
    date: row.date,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    type: "intention",
  };
}

export function toTask(row: EntryRow, tags: Tag[] = []): Task {
  if (row.type !== "task") {
    throw new InvalidEntryTypeError("task");
  }

  return {
    id: row.id,
    date: row.date,
    content: row.content,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    type: "task",
    status: row.status as Task["status"],
    originId: row.originId,
    tags,
  };
}

export function toEntry(row: EntryRow, tags: Tag[] = []): Entry {
  switch (row.type) {
    case "note":
      return toNote(row, tags);
    case "intention":
      return toIntention(row);
    case "task":
      return toTask(row, tags);
    default:
      throw new UnknownEntryType(row.type);
  }
}
