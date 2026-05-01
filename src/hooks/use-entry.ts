import type { Selectable } from "kysely";
import type { MoodTable, NoteTable, TaskTable } from "@/db/schema";
import { useDBQuery } from "./use-db-query";

type EntryRowMap = {
  note: Selectable<NoteTable>;
  task: Selectable<TaskTable>;
  mood: Selectable<MoodTable>;
};

export function useEntry<T extends "note" | "task" | "mood">(
  type: T,
  id: string,
): EntryRowMap[T] | null {
  const rows = useDBQuery((db) => {
    switch (type) {
      case "note":
        return db.selectFrom("notes").selectAll().where("id", "=", id);
      case "task":
        return db.selectFrom("tasks").selectAll().where("id", "=", id);
      default:
        return db.selectFrom("moods").selectAll().where("id", "=", id);
    }
  });

  return (rows?.[0] as EntryRowMap[T]) ?? null;
}
