import { PenIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { Page } from "@/components/layout";
import { TextareaDialog } from "@/components/ui";
import {
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
		<Page className="mb-14 mt-4">
			<PastEntries onEntryClick={props.onEntryClick} />
		</Page>
	);
};

type TodayPageProps = {
	onEntryClick: (entry: Entry) => void;
};

const TodayPage = (props: TodayPageProps) => {
	return (
		<Page className="gap-2 flex flex-col mb-14">
			<TodayHeader />
			<TodayEntries onEntryClick={props.onEntryClick} />
		</Page>
	);
};

const JournalRoute = () => {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
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
				className="app-container-kb horizontal-scroll-snap"
			>
				<div className="snap-page">
					<PastEntriesPage onEntryClick={handleEntryClick} />
				</div>
				<div className="snap-page">
					<TodayPage onEntryClick={handleEntryClick} />
				</div>
			</div>
			<div className="flex items-center bottom-app-bottom fixed right-4 z-50">
				<button
					type="button"
					className="size-11 flex items-center bg-amber-300 text-black rounded-full justify-center active:scale-110 transition-all ms-auto"
					onClick={() => dialog.setCreateEntry()}
				>
					<PenIcon className="size-5" />
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
				entry={getEntryFromDialogMode(dialog.mode)}
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

export const Route = createFileRoute("/")({
	component: JournalRoute,
});
