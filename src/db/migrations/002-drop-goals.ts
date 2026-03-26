import { type Kysely, type Migration, sql } from "kysely";

export const Migration002DropGoals: Migration = {
  async up(db: Kysely<any>) {
    await sql`DELETE FROM entries WHERE type = 'goal'`.execute(db);
  },

  async down(_db: Kysely<any>) {
    // no-op: data deletion is not reversible
  },
};
