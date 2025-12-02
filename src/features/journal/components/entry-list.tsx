import { CheckCircleIcon } from "@phosphor-icons/react";
import type { Entry } from "@/lib/db";
import { formatTime } from "@/lib/utils/dates";
import { useCommentQuery } from "../resources";
import { EntryCommentItem } from "./entry-comment-item";

const EntryItem = (props: { entry: Entry; onClick: () => void }) => {
	const comments = useCommentQuery(props.entry.id);

	return (
		<article className="hover:bg-white/10 transition-colors rounded-xl bg-white/8 p-4">
			<button
				type="button"
				onClick={props.onClick}
				className="w-full text-left"
			>
				<div>
					<span className="flex justify-between">
						<time className="text-white/70 text-sm">
							{formatTime(props.entry.createdAt)}
						</time>
						{props.entry.type === "task" && (
							<span>
								<CheckCircleIcon
									weight={
										props.entry.status === "complete" ? "fill" : "regular"
									}
									className="text-white/50"
								/>
							</span>
						)}
					</span>
					<p className="mt-0.5 max-w-[65ch] text-base leading-7 line-clamp-4">
						{props.entry.content}
					</p>
				</div>
			</button>
			{comments.length > 0 && (
				<div className="mt-1">
					{comments.map((comment) => (
						<EntryCommentItem key={comment.id} comment={comment} />
					))}
				</div>
			)}
		</article>
	);
};

export const EntryList = (props: {
	entries: Entry[];
	onEntryClick: (entry: Entry) => void;
}) => {
	return (
		<div className="space-y-4">
			{props.entries.length > 0 ? (
				props.entries.map((entry) => (
					<EntryItem
						key={entry.id}
						entry={entry}
						onClick={() => props.onEntryClick(entry)}
					/>
				))
			) : (
				<NoEntries />
			)}
		</div>
	);
};

const NoEntries = () => (
	<div className="p-4 text-center text-sm text-white/70 m-auto my-auto self-center">
		No entries yet
	</div>
);
