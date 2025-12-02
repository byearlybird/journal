import { PenIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
	CommentCreator,
	EntryCreator,
	EntryDetailDialog,
	PastEntries,
	TodayEntries,
	TodayHeader,
} from "@/features/journal";
import type { Entry } from "@/lib/db";
import { db } from "@/lib/db";
import { useDialogStore } from "@/lib/stores/dialog";

const getEntryFromDialogMode = (
	mode: ReturnType<typeof useDialogStore>["mode"],
) => {
	if (mode.type === "view-entry" || mode.type === "add-comment") {
		return mode.entry;
	}
	return undefined;
};

type PastEntriesPageProps = {
	onEntryClick: (entry: Entry) => void;
};

const PastEntriesPage = (props: PastEntriesPageProps) => {
	return (
		<div className="mb-14 mt-4 pl-app-left pr-app-right">
			<PastEntries onEntryClick={props.onEntryClick} />
		</div>
	);
};

type TodayPageProps = {
	onEntryClick: (entry: Entry) => void;
};

const TodayPage = (props: TodayPageProps) => {
	return (
		<div className="gap-2 pl-app-left pr-app-right flex flex-col mb-14">
			<TodayHeader />
			<TodayEntries onEntryClick={props.onEntryClick} />
		</div>
	);
};

const JournalRoute = () => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const dialog = useDialogStore();

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
			<div className="flex items-center bottom-app-bottom fixed right-4">
				<button
					type="button"
					className="size-11 flex items-center bg-yellow-300/90 outline outline-white/20 shadow backdrop-blur-lg text-black rounded-full justify-center active:scale-110 transition-all"
					onClick={() => dialog.setCreateEntry()}
				>
					<PenIcon className="size-5" />
				</button>
			</div>
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

export const Route = createFileRoute("/")({
	component: JournalRoute,
});
