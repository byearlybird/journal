import { useNotes, useTodayNotes } from "@app/store/queries";
import type { Note } from "@app/store/store";
import { Tabs } from "@base-ui/react/tabs";
import { format } from "date-fns";

export function JournalPage() {
	const notes = useNotes();
	const todayNotes = useTodayNotes();

	return (
		<Tabs.Root defaultValue="today">
			<Tabs.List className="flex gap-4 p-4">
				<JournalTab value="today">Today</JournalTab>
				<JournalTab value="all">All Entries</JournalTab>
			</Tabs.List>
			<Tabs.Panel value="today" className="flex flex-col gap-4 p-4">
				{todayNotes.map((note) => (
					<JournalEntry format="time" key={note.id} note={note} />
				))}
			</Tabs.Panel>
			<Tabs.Panel value="all" className="flex flex-col gap-4 p-4">
				{notes.map((note) => (
					<JournalEntry format="date" key={note.id} note={note} />
				))}
			</Tabs.Panel>
		</Tabs.Root>
	);
}

function JournalTab({
	value,
	children,
}: {
	value: string;
	children: React.ReactNode;
}) {
	return (
		<Tabs.Tab
			value={value}
			className="rounded-full px-4 py-1 text-white/70 data-active:text-white/90 data-active:bg-black/90 active:scale-105 transition-all"
		>
			{children}
		</Tabs.Tab>
	);
}

function JournalEntry({
	note,
	format: datetimeFormat,
}: {
	note: Note;
	format: "time" | "date";
}) {
	return (
		<article
			key={note.id}
			className="flex flex-col gap-2 rounded-md border border-white/10 border-dashed p-4"
		>
			<time className="text-sm text-white/70">
				{datetimeFormat === "time"
					? format(note.createdAt, "h:mm a")
					: format(note.createdAt, "MMM d, yyyy")}
			</time>
			{note.content}
		</article>
	);
}
