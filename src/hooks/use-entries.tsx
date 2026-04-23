import { useDBQuery } from "./use-db-query";

export function useEntries() {
  return useDBQuery((db) => db.selectFrom("timeline").orderBy("created_at", "desc").selectAll());
}
