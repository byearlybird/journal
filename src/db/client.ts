import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { Kysely } from "kysely";
import CapacitorSQLiteKyselyDialect from "capacitor-sqlite-kysely";
import type { Database as DatabaseSchema } from "./schema";

export const db = new Kysely<DatabaseSchema>({
  dialect: new CapacitorSQLiteKyselyDialect(
    new SQLiteConnection(CapacitorSQLite),
    { name: "journal-v1" },
  ),
});
