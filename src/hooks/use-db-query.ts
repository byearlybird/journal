import type { Compilable, Kysely } from "kysely";
import { useReactiveQuery } from "sqlocal/react";
import { sqlocal, db } from "@/db/client";
import type { DBSchema } from "@/db/schema";

export function useDBQuery<T>(build: (db: Kysely<DBSchema>) => Compilable<T>): T[] | undefined {
  const { data } = useReactiveQuery(sqlocal, build(db).compile());
  return data as T[] | undefined;
}
