import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
	Transition,
} from "@headlessui/react";
import {
	ChatBubbleLeftEllipsisIcon,
	CheckIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { formatEntryDate } from "../utils/formatDate";
import { Button } from "./Button";
import { useMutate, useQuery } from "./StoreContext";
import { Textarea } from "./Textarea";

export const EntryDialog = ({
	entryId,
	onClose,
}: {
	entryId: string | null;
	onClose: () => void;
}) => {
	const { update } = useMutate();
	const [commenting, setCommenting] = useState(false);
	const [comment, setComment] = useState("");

	const entry = useQuery((data) => (entryId ? data[entryId] : undefined));

	const handleCommentSubmit = () => {
		if (!entryId) return;
		update(entryId, (current) => ({
			comments: [
				...(current.comments || []),
				{
					id: crypto.randomUUID(),
					content: comment,
					createdAt: new Date().toISOString(),
				},
			],
		}));
	};

	return (
		<Dialog open={!!entry} onClose={onClose}>
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-black opacity-30 transition-opacity duration-200 data-[closed]:opacity-0 data-[enter]:ease-out data-[leave]:ease-in sm:flex sm:justify-center dark:opacity-70"
			/>
			<DialogPanel
				transition
				className="data-[closed]:-translate-y-full fixed inset-x-0 top-0 flex max-h-2/3 min-h-1/3 translate-y-0 flex-col gap-3 overflow-y-scroll rounded-b-xl border-b bg-background/90 p-3 text-foreground shadow-xl backdrop-blur-xs transition-transform duration-300 ease-out data-[enter]:ease-out data-[leave]:ease-in"
			>
				<DialogTitle className="sr-only">
					Dialog entry for {entry?.createdAt}
				</DialogTitle>
				{/* Scrollable content area with bottom padding to avoid overlap with sticky footer */}
				<div className="space-y-4 overflow-y-scroll pb-12">
					<div className="sticky top-0 z-10 space-y-2 rounded-md border border-border/50 bg-card/95 p-3 backdrop-blur-xs">
						<time className="text-muted-foreground text-sm">
							{entry?.createdAt ? formatEntryDate(entry.createdAt) : ""}
						</time>
						<p className="whitespace-pre-wrap">{entry?.content}</p>
					</div>
					<div className="space-y-2">
						{entry?.comments?.map((comment) => (
							<div
								key={comment.id}
								className="space-y-1 rounded-md bg-muted p-3 text-muted-foreground"
							>
								<time className="text-muted-foreground text-xs">
									{formatEntryDate(comment.createdAt)}
								</time>
								<p className="whitespace-pre-wrap text-sm">{comment.content}</p>
							</div>
						))}
					</div>
					<Transition
						show={commenting}
						enter="transition ease-out duration-200"
						enterFrom="opacity-0 scale-95 -translate-y-1"
						enterTo="opacity-100 scale-100 translate-y-0"
						leave="transition ease-in duration-150"
						leaveFrom="opacity-100 scale-100 translate-y-0"
						leaveTo="opacity-0 scale-95 -translate-y-1"
					>
						<Textarea
							autoFocus
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							className="bg-muted/95"
						/>
					</Transition>
				</div>
				{/* Sticky footer */}
				<div className="absolute right-0 bottom-0 left-0 flex w-full items-center justify-between p-2">
					<Button elevated variant="outline" onClick={onClose}>
						<span className="sr-only">Close</span>
						<XMarkIcon />
					</Button>
					<div className="flex items-center gap-2">
						<Transition
							show={commenting}
							enter="transition ease-out duration-200"
							enterFrom="opacity-0 scale-95 -translate-y-1"
							enterTo="opacity-100 scale-100 translate-y-0"
							leave="transition ease-in duration-150"
							leaveFrom="opacity-100 scale-100 translate-y-0"
							leaveTo="opacity-0 scale-95 -translate-y-1"
						>
							<div key="cancel-btn">
								<Button
									elevated
									variant="outline"
									onClick={() => setCommenting(false)}
								>
									Cancel
								</Button>
							</div>
						</Transition>
						<Button
							elevated
							variant="secondary"
							disabled={commenting && !comment}
							onClick={() => {
								if (commenting) {
									handleCommentSubmit();
								} else {
									setCommenting(true);
								}
							}}
						>
							<span className="sr-only">Add Comment</span>
							{!commenting && <ChatBubbleLeftEllipsisIcon />}
							{commenting && <CheckIcon />}
						</Button>
					</div>
				</div>
			</DialogPanel>
		</Dialog>
	);
};
