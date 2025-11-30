import { MessageCircle, X } from "lucide-solid";
import { For, Show } from "solid-js";
import { Button, Drawer } from "@/components/ui";
import type { Comment, Entry } from "@/lib/db";
import { formatDateTime } from "@/lib/utils/dates";
import { createCommentQuery } from "../resources";
import { EntryCommentItem } from "./entry-comment-item";

const Timestamp = (props: { createdAt: string }) => (
	<time class="text-white/70 text-sm mb-2">
		{formatDateTime(props.createdAt)}
	</time>
);

const Comments = (props: { comments: Comment[]; entryCreatedAt: string }) => (
	<Show when={props.comments.length > 0}>
		<div class="mt-4">
			<For each={props.comments}>
				{(comment) => (
					<EntryCommentItem
						comment={comment}
						timestamp={props.entryCreatedAt}
					/>
				)}
			</For>
		</div>
	</Show>
);

const Actions = (props: { onClose: () => void; onComment: () => void }) => {
	return (
		<div class="justify-between flex items-center w-full">
			<Button
				onClick={props.onClose}
				variant="outline-lightgray"
				size="md-icon"
			>
				<X />
			</Button>
			<Button variant="outline-yellow" size="md-icon" onClick={props.onComment}>
				<MessageCircle />
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
	const comments = createCommentQuery(() => props.entry?.id ?? "");

	return (
		<Drawer.Root
			open={props.isOpen}
			onOpenChange={props.onClose}
			onExitComplete={props.onExitComplete}
		>
			<Drawer.Content>
				<Show when={props.entry}>
					<Drawer.Toolbar>
						<Actions onClose={props.onClose} onComment={props.onComment} />
					</Drawer.Toolbar>
				</Show>
				<Drawer.Body>
					<Show when={props.entry}>
						{(entry) => (
							<>
								<Timestamp createdAt={entry().createdAt} />
								<div class="font-serif my-1.5 leading-8">{entry().content}</div>
								<Comments
									comments={comments()}
									entryCreatedAt={entry().createdAt}
								/>
							</>
						)}
					</Show>
				</Drawer.Body>
			</Drawer.Content>
		</Drawer.Root>
	);
};
