import type { Entry } from "@/lib/db";
import { useDateNow } from "@/lib/hooks";
import { useEntriesQuery } from "../resources";
import { EntryList } from "./entry-list";

export function TodayEntries(props: { onEntryClick: (entry: Entry) => void }) {
	const today = useDateNow();
	const entries = useEntriesQuery(today.toISOString());

	return entries.length > 0 ? (
		<EntryList entries={entries} onEntryClick={props.onEntryClick} />
	) : (
		<p className="text-center p-10 text-white/70">No entries yet today</p>
	);
}
