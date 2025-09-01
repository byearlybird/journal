import { createSystemClock } from "@journal/crdt/clock";
import { createBunPersister } from "@journal/crdt/persistence/bun";
import { createStore, withPersistence } from "@journal/crdt/store";
import { chain } from "@journal/fn";
import type { Entry } from "@journal/schema";
import { createEntryService } from "@journal/services";

export const entryService = chain()
	.pipe(() =>
		createStore<Record<string, Entry>>({
			clockProvider: createSystemClock(),
		}),
	)
	.pipe((store) =>
		withPersistence(store, {
			key: "entries",
			persistenceProvider: createBunPersister({
				dbPath: "sqlite://journal.db",
			}),
		}),
	)
	.pipe((store) => createEntryService(store))
	.get();
