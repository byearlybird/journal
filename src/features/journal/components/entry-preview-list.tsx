import { ChatCircleIcon } from "@phosphor-icons/react";
import type { Entry } from "@/lib/db";
import { formatTime } from "@/lib/utils/dates";
import { useCommentQuery } from "../resources";
import { EntryDateCard } from "./entry-date-card";

const EntryPreviewItem = (props: { entry: Entry; onClick: () => void }) => {
	const comments = useCommentQuery(props.entry.id);

	return (
		<article
			onClick={props.onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					props.onClick();
				}
			}}
			className="rounded-lg p-3 hover:bg-white/5 transition-colors"
		>
			<div className="flex items-center gap-3 text-xs">
				<time className="text-white/70">
					{formatTime(props.entry.createdAt)}
				</time>
				{comments.length > 0 && <ChatCircleIcon className="size-2.5" />}
			</div>
			<p className="mt-1.5 line-clamp-2 text-ellipsis text-sm leading-7 font-serif">
				{props.entry.content}
			</p>
		</article>
	);
};

type EntryPreviewListProps = {
	data: Array<{ date: string; entries: Entry[] }>;
	onEntryClick: (entry: Entry) => void;
};

export const EntryPreviewList = (props: EntryPreviewListProps) => (
	<div className="space-y-4">
		{props.data.length > 0 ? (
			props.data.map(({ date, entries }) => (
				<EntryDateCard key={date} date={date}>
					{entries.map((entry) => (
						<EntryPreviewItem
							key={entry.id}
							entry={entry}
							onClick={() => props.onEntryClick(entry)}
						/>
					))}
				</EntryDateCard>
			))
		) : (
			<NoEntries />
		)}
	</div>
);

const NoEntries = () => (
	<div className="text-center text-sm text-white/70 m-auto my-auto self-center p-4">
		Past entries will appear here
	</div>
);
