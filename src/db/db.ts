import { Kysely } from "kysely";
import type { DatabasePath } from "sqlocal";
import { SQLocalKysely } from "sqlocal/kysely";
import type { Database } from "./schema";

export const createDb = (databasePath: DatabasePath) => {
  const client = new SQLocalKysely(databasePath);
  const db = new Kysely<Database>({ dialect: client.dialect });

  return {
    db,
    client,
  };
};

export const { db, client } = createDb("journal-local-9192390.db");

export type Db = typeof db;
