import { useStore } from "@nanostores/react";
import { store } from ".";

export function useNotes() {
	return useStore(
		store.query(["notes"], ({ notes }) => Array.from(notes.values())),
		{
			deps: [store],
		},
	);
}
