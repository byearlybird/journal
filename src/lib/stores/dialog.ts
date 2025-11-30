import { createStore } from "solid-js/store";
import type { Entry } from "@/lib/db";

type DialogMode =
	| { type: "none" }
	| { type: "create-entry" }
	| { type: "view-entry"; entry: Entry }
	| { type: "add-comment"; entry: Entry };

type DialogStore = {
	mode: DialogMode;
};

const [dialogStore, setDialogStore] = createStore<DialogStore>({
	mode: { type: "none" },
});

export const useDialogStore = () => {
	return {
		mode: () => dialogStore.mode,
		setCreateEntry: () => setDialogStore({ mode: { type: "create-entry" } }),
		setViewEntry: (entry: Entry) =>
			setDialogStore({ mode: { type: "view-entry", entry } }),
		setAddComment: (entry: Entry) =>
			setDialogStore({ mode: { type: "add-comment", entry } }),
		close: () => setDialogStore({ mode: { type: "none" } }),
	};
};
