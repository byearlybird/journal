import { Migrator } from "kysely";
import { type Db, db } from "./db";

export const createMigrator = (db: Db) =>
  new Migrator({
    db,
    provider: {
      async getMigrations() {
        const { migrations } = await import("./migrations/");
        return migrations;
      },
    },
  });

export const migrator = createMigrator(db);
