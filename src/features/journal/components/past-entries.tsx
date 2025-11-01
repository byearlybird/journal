import { isSameDay } from "date-fns";
import { useMemo } from "react";
import type { Entry } from "@/lib/db";
import { useDateNow } from "@/lib/hooks";
import { useEntriesQuery } from "../resources";
import { EntryPreviewList } from "./entry-preview-list";

export function PastEntries(props: { onEntryClick: (entry: Entry) => void }) {
	const today = useDateNow();
	const allEntries = useEntriesQuery();

	const pastEntries = useMemo(() => {
		if (!allEntries) return [];

		const grouped = allEntries
			.filter((e) => !isSameDay(today, e.createdAt))
			.reduce(
				(acc, entry) => {
					// biome-ignore lint/style/noNonNullAssertion: <always defined>
					const date = entry.createdAt.split("T")[0]!;
					if (!acc[date]) {
						acc[date] = [];
					}
					acc[date].push({
						id: entry.id,
						content: entry.content,
						createdAt: entry.createdAt,
					});
					return acc;
				},
				{} as Record<
					string,
					{ id: string; content: string; createdAt: string }[]
				>,
			);

		return Object.entries(grouped).map(([date, entries]) => ({
			date,
			entries,
		}));
	}, [allEntries, today]);

	return (
		<EntryPreviewList data={pastEntries} onEntryClick={props.onEntryClick} />
	);
}
