import { useStore } from "@tanstack/react-store";
import { Store } from "@tanstack/store";
import type { Entry } from "@/lib/db";

type DialogMode =
	| { type: "none" }
	| { type: "create-entry" }
	| { type: "view-entry"; entry: Entry }
	| { type: "add-comment"; entry: Entry };

type DialogStore = {
	mode: DialogMode;
};

const dialogStore = new Store<DialogStore>({
	mode: { type: "none" },
});

export const useDialogStore = () => {
	const mode = useStore(dialogStore, (state) => state.mode);

	return {
		mode,
		setCreateEntry: () =>
			dialogStore.setState((state) => ({
				...state,
				mode: { type: "create-entry" },
			})),
		setViewEntry: (entry: Entry) =>
			dialogStore.setState((state) => ({
				...state,
				mode: { type: "view-entry", entry },
			})),
		setAddComment: (entry: Entry) =>
			dialogStore.setState((state) => ({
				...state,
				mode: { type: "add-comment", entry },
			})),
		close: () =>
			dialogStore.setState((state) => ({
				...state,
				mode: { type: "none" },
			})),
	};
};
