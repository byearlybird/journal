import { MessageCircle } from "lucide-solid";
import { For, Show } from "solid-js";
import type { Entry } from "@/lib/db";
import { formatTime } from "@/lib/utils/dates";
import { createCommentQuery } from "../resources";
import { EntryDateCard } from "./entry-date-card";

const EntryPreviewItem = (props: { entry: Entry; onClick: () => void }) => {
	const comments = createCommentQuery(() => props.entry.id);

	return (
		<article
			onClick={props.onClick}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					props.onClick();
				}
			}}
			class="rounded-lg p-3 hover:bg-white/5 transition-colors"
		>
			<div class="flex items-center gap-3 text-xs">
				<time class="text-white/70">{formatTime(props.entry.createdAt)}</time>
				<Show when={comments().length > 0}>
					<MessageCircle class="size-2.5" />
				</Show>
			</div>
			<p class="mt-1.5 line-clamp-3 text-ellipsis text-sm leading-7 font-serif">
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
	<div class="space-y-4">
		<For each={props.data} fallback={<NoEntries />}>
			{({ date, entries }) => (
				<EntryDateCard date={date}>
					<For each={entries}>
						{(entry) => (
							<EntryPreviewItem
								entry={entry}
								onClick={() => props.onEntryClick(entry)}
							/>
						)}
					</For>
				</EntryDateCard>
			)}
		</For>
	</div>
);

const NoEntries = () => (
	<div class="text-center text-sm text-white/70 m-auto my-auto self-center p-4">
		Past entries will appear here
	</div>
);
