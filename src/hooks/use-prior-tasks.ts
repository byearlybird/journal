import type { DBSchema } from "@/db/schema";
import { useDBQuery } from "./use-db-query";

type Task = DBSchema["tasks"];

export function usePriorTasks(): Task[] | undefined {
  return useDBQuery((db) =>
    db
      .selectFrom("tasks")
      .selectAll()
      .where("status", "=", "incomplete")
      .orderBy("date", "asc"),
  ) as Task[] | undefined;
}
