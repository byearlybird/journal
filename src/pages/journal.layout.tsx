import { Pen } from "lucide-react";
import type { ReactNode } from "react";
import { TextareaDialog } from "@/components/ui";
import { EntryDetailDialog } from "@/features/journal";
import type { Entry } from "@/lib/db";
import { db } from "@/lib/db";
import { useDialogStore } from "@/lib/stores/dialog";

export const JournalLayout = (props: { children: ReactNode }) => {
	const dialog = useDialogStore();

	const handleCreateEntry = (content: string) => {
		db.entries.add({ content });
		dialog.close();
	};

	const handleAddComment = (content: string) => {
		const mode = dialog.mode;
		if (mode.type !== "add-comment") return;

		db.comments.add({
			entryId: mode.entry.id,
			content,
		});
		dialog.setViewEntry(mode.entry);
	};

	const handleCommentButtonClick = () => {
		const mode = dialog.mode;
		if (mode.type === "view-entry") {
			dialog.setAddComment(mode.entry);
		}
	};

	const handleCloseDialog = () => {
		dialog.close();
	};

	return (
		<>
			{props.children}
			<div className="flex items-center bottom-[var(--safe-bottom)] fixed right-4">
				<button
					type="button"
					className="size-11 flex items-center bg-amber-300 text-black rounded-full justify-center active:scale-110 transition-all ms-auto"
					onClick={() => dialog.setCreateEntry()}
				>
					<Pen className="size-5" />
				</button>
			</div>
			<TextareaDialog
				open={dialog.mode.type === "create-entry"}
				onOpenChange={(e) => {
					if (!e.open) dialog.close();
				}}
				onSubmit={handleCreateEntry}
				onCancel={handleCloseDialog}
			/>
			<TextareaDialog
				open={dialog.mode.type === "add-comment"}
				onOpenChange={(e) => {
					const mode = dialog.mode;
					if (!e.open && mode.type === "add-comment") {
						dialog.setViewEntry(mode.entry);
					}
				}}
				onSubmit={handleAddComment}
				onCancel={() => {
					const mode = dialog.mode;
					if (mode.type === "add-comment") {
						dialog.setViewEntry(mode.entry);
					}
				}}
			/>
			<EntryDetailDialog
				entry={
					dialog.mode.type === "view-entry" ||
					dialog.mode.type === "add-comment"
						? (dialog.mode as { entry: Entry }).entry
						: undefined
				}
				isOpen={
					dialog.mode.type === "view-entry" ||
					dialog.mode.type === "add-comment"
				}
				onClose={handleCloseDialog}
				onExitComplete={handleCloseDialog}
				onComment={handleCommentButtonClick}
			/>
		</>
	);
};

export default JournalLayout;
