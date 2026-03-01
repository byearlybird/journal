import { SQLocalKysely } from "sqlocal/kysely";
import { Kysely } from "kysely";
import type { Database as DatabaseSchema } from "./schema";

const { dialect } = new SQLocalKysely("journal.sqlite3");
export const db = new Kysely<DatabaseSchema>({ dialect });
