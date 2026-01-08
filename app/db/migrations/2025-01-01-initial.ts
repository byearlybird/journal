import type { Kysely, Migration } from "kysely";

export const Migration20250101: Migration = {
	async up(db: Kysely<any>) {
		await db.schema
			.createTable("note")
			.addColumn("id", "text", (c) => c.primaryKey().notNull())
			.addColumn("eventstamp", "text", (c) => c.notNull())
			.addColumn("tombstone", "integer", (c) => c.notNull().defaultTo(0))
			.addColumn("content", "text", (c) => c.notNull())
			.addColumn("created_at", "text", (c) => c.notNull())
			.execute();
	},
	async down(db: Kysely<any>) {
		await db.schema.dropTable("note").execute();
	},
};
