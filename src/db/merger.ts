import z from "zod";
import type { Db } from "./db";

const SCHEMA_VERSION = 1;

const stateSchema = z.object({
	notes: z.array(
		z.object({
			id: z.string(),
			content: z.string(),
			created_at: z.string(),
			updated_at: z.string(),
			deleted_at: z.string().nullable(),
		}),
	),
	schema_version: z.number(),
});

type State = z.infer<typeof stateSchema>;

export async function dump(db: Db): Promise<string> {
	const notes = await db.selectFrom("note").selectAll().execute();
	const state: State = {
		notes,
		schema_version: SCHEMA_VERSION,
	};
	return JSON.stringify(state);
}

export async function merge(db: Db, remoteState: string) {
	const state = stateSchema.parse(JSON.parse(remoteState));
	if (state.schema_version !== SCHEMA_VERSION) {
		throw new Error("Schema version mismatch");
	}

	return await db.transaction().execute(async (tx) => {
		await tx
			.insertInto("note")
			.values(state.notes)
			.onConflict((oc) =>
				oc
					.doUpdateSet((eb) => ({
						content: eb.ref("excluded.content"),
						created_at: eb.ref("excluded.created_at"),
						updated_at: eb.ref("excluded.updated_at"),
						deleted_at: eb.ref("excluded.deleted_at"),
					}))
					.where((eb) =>
						eb("excluded.updated_at", ">", eb.ref("note.updated_at")),
					),
			)
			.execute();
	});
}
