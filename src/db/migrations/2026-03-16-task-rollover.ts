import { type Kysely, type Migration } from "kysely";

export const Migration20260316TaskRollover: Migration = {
  async up(db: Kysely<any>) {
    await db.schema.alterTable("tasks").addColumn("original_id", "text").execute();
  },
  async down(db: Kysely<any>) {
    await db.schema.alterTable("tasks").dropColumn("original_id").execute();
  },
};
