import { useDBQuery } from "./use-db-query";

export function useEntriesOnDate(date: string) {
  const results = useDBQuery((db) =>
    db
      .selectFrom("timeline")
      .where("created_at", "like", `${date}%`)
      .orderBy("created_at", "desc")
      .selectAll(),
  );

  return results ?? [];
}
