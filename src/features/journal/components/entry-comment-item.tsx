import { cx } from "cva";
import { CornerDownRight } from "lucide-solid";
import { Show } from "solid-js";
import type { Comment } from "@/lib/db";
import { formatDistance } from "@/lib/utils/dates";

export const EntryCommentItem = (props: {
	comment: Comment;
	class?: string;
	timestamp?: string;
}) => {
	return (
		<div
			class={cx(
				props.timestamp ? "flex gap-2 p-2" : "flex items-center gap-2 p-2",
				props.class,
			)}
		>
			<CornerDownRight class="size-4 flex-shrink-0" />
			<div class="flex flex-col gap-2 pl-1">
				<p class="max-w-[55ch] text-white/70 text-sm font-serif">
					{props.comment.content}
				</p>
				<Show when={props.timestamp}>
					{(timestamp) => (
						<time class="text-white/70 text-xs">
							{formatDistance(props.comment.createdAt, timestamp())} later
						</time>
					)}
				</Show>
			</div>
		</div>
	);
};
