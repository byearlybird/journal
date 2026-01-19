import type { Note, Task } from "@app/store";

export type EntryType = "note" | "task";
export type NoteEntry = Note & { type: "note" };
export type TaskEntry = Task & { type: "task" };
export type Entry = NoteEntry | TaskEntry;

export function isNoteEntry(entry: Entry): entry is NoteEntry {
  return entry.type === "note";
}

export function isTaskEntry(entry: Entry): entry is TaskEntry {
  return entry.type === "task";
}
