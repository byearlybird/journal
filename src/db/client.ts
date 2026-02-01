import { appDataDir } from "@tauri-apps/api/path";
import Database from "@tauri-apps/plugin-sql";
import { Kysely } from "kysely";
import { TauriSqliteDialect } from "kysely-dialect-tauri";
import type { Database as DatabaseSchema } from "./schema";

export const db = new Kysely<DatabaseSchema>({
  dialect: new TauriSqliteDialect({
    database: async (prefix) => Database.load(`${prefix}${await appDataDir()}journal-v1.db`),
  }),
});
