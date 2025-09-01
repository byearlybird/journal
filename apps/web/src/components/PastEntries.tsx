import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import type { Entry } from "client/collections/entries";
import { formatMonthDateYear, formatTime, todayISO } from "../utils/formatDate";
import { useQuery } from "./StoreContext";

type PastEntriesProps = {
	onSelect: (id: string) => void;
};

const DayEntries = (props: {
	date: string;
	entries: Entry[];
	onSelect: (id: string) => void;
}) => {
	return (
		<div className="rounded-md border bg-card p-3 text-card-foreground">
			<h3 className="font-semibold">{formatMonthDateYear(props.date)}</h3>
			<div className="divide-y divide-border/50">
				{props.entries.map((entry) => (
					<article
						key={entry.$id}
						className="space-y-1 py-3 transition-all active:brightness-110"
						onClick={() => props.onSelect(entry.$id)}
						onKeyDown={(event) => {
							if (event.key === "Enter") {
								props.onSelect(entry.$id);
							}
						}}
					>
						<p className="flex items-center justify-between text-muted-foreground text-xs">
							<time>{formatTime(entry.createdAt)}</time>
							{entry.comments.length > 0 && (
								<span className="flex items-center gap-1.5 p-0.5 px-1">
									{entry.comments.length}
									<ChatBubbleLeftIcon className="size-3" />
								</span>
							)}
						</p>
						<p className="text-muted-foreground text-sm">{entry.content}</p>
					</article>
				))}
			</div>
		</div>
	);
};

export function PastEntries({ onSelect }: PastEntriesProps) {
	const groups = useQuery((data) => {
		// Only past entries
		const filtered = Object.values(data)
			.filter((entry) => entry.date < todayISO())
			// Sort by date desc, then createdAt desc
			.sort((a, b) =>
				b.date === a.date
					? b.createdAt.localeCompare(a.createdAt)
					: b.date.localeCompare(a.date),
			);

		// Group by date
		const byDate = new Map<string, Entry[]>();
		for (const entry of filtered) {
			const list = byDate.get(entry.date) ?? [];
			list.push(entry);
			byDate.set(entry.date, list);
		}

		return Array.from(byDate.entries()).map(([date, entries]) => ({
			date,
			entries,
		}));
	});

	return (
		<>
			{groups.map((g) => (
				<DayEntries
					key={g.date}
					date={g.date}
					entries={g.entries}
					onSelect={onSelect}
				/>
			))}
		</>
	);
}
