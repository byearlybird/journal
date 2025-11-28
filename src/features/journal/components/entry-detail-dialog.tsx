import { ChatCircleIcon, XIcon } from "@phosphor-icons/react";
import { Button, Drawer } from "@/components/ui";
import type { Comment, Entry } from "@/lib/db";
import { formatDateTime } from "@/lib/utils/dates";
import { useCommentQuery } from "../resources";
import { EntryCommentItem } from "./entry-comment-item";

const Timestamp = (props: { createdAt: string }) => (
	<time className="text-white/70 text-sm mb-2">
		{formatDateTime(props.createdAt)}
	</time>
);

const Comments = (props: { comments: Comment[]; entryCreatedAt: string }) => (
	<>
		{props.comments.length > 0 && (
			<div className="mt-4">
				{props.comments.map((comment) => (
					<EntryCommentItem
						key={comment.id}
						comment={comment}
						timestamp={props.entryCreatedAt}
					/>
				))}
			</div>
		)}
	</>
);

const Actions = (props: { onClose: () => void; onComment: () => void }) => {
	return (
		<div className="justify-between flex items-center w-full">
			<Button
				onClick={props.onClose}
				variant="outline-lightgray"
				size="md-icon"
			>
				<XIcon />
			</Button>
			<Button variant="outline-yellow" size="md-icon" onClick={props.onComment}>
				<ChatCircleIcon />
			</Button>
		</div>
	);
};

export const EntryDetailDialog = (props: {
	entry: Entry | undefined;
	isOpen: boolean;
	onClose: () => void;
	onExitComplete?: () => void;
	onComment: () => void;
}) => {
	const comments = useCommentQuery(props.entry?.id ?? "");

	return (
		<Drawer.Root
			open={props.isOpen}
			onOpenChange={props.onClose}
			onExitComplete={props.onExitComplete}
		>
			<Drawer.Content>
				{props.entry && (
					<Drawer.Toolbar>
						<Actions onClose={props.onClose} onComment={props.onComment} />
					</Drawer.Toolbar>
				)}
				<Drawer.Body>
					{props.entry && (
						<>
							<Timestamp createdAt={props.entry.createdAt} />
							<div className="font-serif my-1.5 leading-8">
								{props.entry.content}
							</div>
							<Comments
								comments={comments}
								entryCreatedAt={props.entry.createdAt}
							/>
						</>
					)}
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
