import { SQLocalKysely } from "sqlocal/kysely";
import { Kysely } from "kysely";
import type { DBSchema } from "./schema";

export const sqlocal = new SQLocalKysely({ databasePath: ":memory:", reactive: true });

const { dialect } = sqlocal;

export const db = new Kysely<DBSchema>({ dialect });
