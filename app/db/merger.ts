import { createDb, type Db } from "./db";
import { createMigrator } from "./migrator";

type DbFile =
	| File
	| Blob
	| ArrayBuffer
	| Uint8Array<ArrayBuffer>
	| ReadableStream<Uint8Array<ArrayBuffer>>;

export async function merge(localDb: Db, dbFile: DbFile) {
	const { db: remoteDb, client: remoteClient } = createDb(":memory:");

	await remoteClient.overwriteDatabaseFile(dbFile);

	const remoteMigrator = createMigrator(remoteDb);

	await remoteMigrator.migrateToLatest();

	await localDb.transaction().execute(async (tx) => {
		const remoteNotes = await remoteDb.selectFrom("note").selectAll().execute();
		await tx
			.insertInto("note")
			.values(remoteNotes)
			.onConflict((oc) =>
				oc
					.doUpdateSet((eb) => ({
						eventstamp: eb.ref("excluded.eventstamp"),
						tombstone: eb.ref("excluded.tombstone"),
						content: eb.ref("excluded.content"),
						created_at: eb.ref("excluded.created_at"),
					}))
					.where((eb) =>
						eb("excluded.eventstamp", ">", eb.ref("note.eventstamp")),
					),
			)
			.execute();
	});
}
