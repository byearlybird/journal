import type { DBSchema } from "@/db/schema";
import { useDBQuery } from "./use-db-query";
import { useTodayDate } from "./use-today-date";

type Task = DBSchema["tasks"];

export function usePriorTasks(): Task[] | undefined {
  const today = useTodayDate();
  return useDBQuery((db) =>
    db
      .selectFrom("tasks")
      .selectAll()
      .where("status", "=", "incomplete")
      .where("date", "<", today)
      .orderBy("date", "asc"),
  ) as Task[] | undefined;
}
