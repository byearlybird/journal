import { Kysely } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { Database } from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const db = new Kysely<Database>({
  dialect: new LibsqlDialect({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  }),
});
