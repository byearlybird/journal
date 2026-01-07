import type { Kysely, Migration } from "kysely";

export const Migration20250101: Migration = {
	async up(db: Kysely<any>) {
		await db.schema
			.createTable("sync_meta")
			.addColumn("key", "text", (c) => c.primaryKey().notNull())
			.addColumn("value", "integer", (c) => c.notNull())
			.execute();

		await db
			.insertInto("sync_meta")
			.values({
				key: "clock_timestamp",
				value: Date.now(),
			})
			.execute();

		await db
			.insertInto("sync_meta")
			.values({
				key: "clock_sequence",
				value: 0,
			})
			.execute();

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
		await db.schema.dropTable("sync_meta").execute();
	},
};
