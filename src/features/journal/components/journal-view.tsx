import { useEffect, useRef } from "react";
import {
	CommentCreator,
	EntryCreator,
	EntryDetailDialog,
} from "@/features/journal";
import { PastEntriesPage } from "./past-entries-page";
import { TodayPage } from "./today-page";
import { CreateEntryFab } from "./create-entry-fab";
import { getEntryFromDialogMode } from "../utils/dialog-helpers";
import { useDatabase } from "@/lib/db/context";
import { useDialogStore } from "@/lib/stores/dialog";
import type { Entry } from "@/lib/db";

export const JournalView = () => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const dialog = useDialogStore();
	const db = useDatabase();

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

	const handleToggleStatus = () => {
		const mode = dialog.mode;
		if (mode.type === "view-entry" && mode.entry.type === "task") {
			const newStatus =
				mode.entry.status === "complete" ? "incomplete" : "complete";
			db.tasks.update(mode.entry.id, { status: newStatus });
			dialog.setViewEntry({ ...mode.entry, status: newStatus });
		}
	};

	const handleEntryClick = (entry: Entry) => {
		dialog.setViewEntry(entry);
	};

	// Scroll to Today page on mount
	useEffect(() => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollTo({
				left: scrollContainerRef.current.clientWidth,
				behavior: "instant",
			});
		}
	}, []);

	return (
		<>
			<div
				ref={scrollContainerRef}
				className="app-container-kb p-0 horizontal-scroll-snap"
			>
				<div className="snap-page">
					<PastEntriesPage onEntryClick={handleEntryClick} />
				</div>
				<div className="snap-page">
					<TodayPage onEntryClick={handleEntryClick} />
				</div>
			</div>
			<CreateEntryFab onClick={() => dialog.setCreateEntry()} />
			<CommentCreator
				open={dialog.mode.type === "add-comment"}
				onOpenChange={(open) => {
					const mode = dialog.mode;
					if (!open && mode.type === "add-comment") {
						dialog.setViewEntry(mode.entry);
					}
				}}
				onSubmit={handleAddComment}
				entryContent={
					dialog.mode.type === "add-comment" ? dialog.mode.entry.content : ""
				}
			/>
			<EntryDetailDialog
				entry={getEntryFromDialogMode(dialog.mode)}
				isOpen={
					dialog.mode.type === "view-entry" ||
					dialog.mode.type === "add-comment"
				}
				onClose={handleCloseDialog}
				onComment={handleCommentButtonClick}
				onToggleStatus={handleToggleStatus}
			/>
			<EntryCreator
				open={dialog.mode.type === "create-entry"}
				onOpenChange={(open) => {
					if (!open) dialog.close();
				}}
				onSubmit={(content, type) => {
					if (type === "note") {
						db.notes.add({ content });
					} else {
						db.tasks.add({ content });
					}
					dialog.close();
				}}
			/>
		</>
	);
};

