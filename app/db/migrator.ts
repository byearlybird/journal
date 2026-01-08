import { Migrator } from "kysely";
import { db } from "./db";

export const migrator = new Migrator({
	db,
	provider: {
		async getMigrations() {
			const { migrations } = await import("./migrations/");
			return migrations;
		},
	},
});
