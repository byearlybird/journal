import { cx } from "cva";
import { CornerDownRight } from "lucide-react";
import type { Comment } from "@/lib/db";
import { formatDistance } from "@/lib/utils/dates";

export const EntryCommentItem = (props: {
	comment: Comment;
	className?: string;
	timestamp?: string;
}) => {
	return (
		<div
			className={cx(
				props.timestamp ? "flex gap-2 p-2" : "flex items-center gap-2 p-2",
				props.className,
			)}
		>
			<CornerDownRight className="size-4 flex-shrink-0" />
			<div className="flex flex-col gap-2 pl-1">
				<p className="max-w-[55ch] text-white/70 text-sm font-serif">
					{props.comment.content}
				</p>
				{props.timestamp && (
					<time className="text-white/70 text-xs">
						{formatDistance(props.comment.createdAt, props.timestamp)} later
					</time>
				)}
			</div>
		</div>
	);
};
