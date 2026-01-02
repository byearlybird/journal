import { useStore } from "@nanostores/react";
import { store } from ".";

export const useNotes = () =>
	useStore(store.query(["notes"], ({ notes }) => Array.from(notes.values())));
