import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { Compilable, Kysely } from "kysely";
import type { SQLocalKysely } from "sqlocal/kysely";
import { useReactiveQuery } from "sqlocal/react";
import { sqlocal, db } from "./client";
import type { DBSchema } from "./schema";

const DBContext = createContext<{ sqlocal: SQLocalKysely; db: Kysely<DBSchema> } | null>(null);

export function DBProvider({ children }: { children: ReactNode }) {
  return <DBContext.Provider value={{ sqlocal, db }}>{children}</DBContext.Provider>;
}

export function useDB() {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error("useDB must be used within DBProvider");
  return ctx.db;
}

export function useQuery<T>(query: Compilable<T>): T[] | undefined {
  const ctx = useContext(DBContext);
  if (!ctx) throw new Error("useQuery must be used within DBProvider");
  const { data } = useReactiveQuery(ctx.sqlocal, query.compile());
  return data as T[] | undefined;
}
