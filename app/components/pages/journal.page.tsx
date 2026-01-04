import { useNotes, useTodayNotes } from "@app/store/queries";
import type { Note } from "@app/store/store";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { format } from "date-fns";

export function JournalPage() {
	const notes = useNotes();
	const todayNotes = useTodayNotes();

	return (
		<TabGroup defaultIndex={0}>
			<TabList className="flex gap-4 p-4">
				<JournalTab>Today</JournalTab>
				<JournalTab>All Entries</JournalTab>
			</TabList>
			<TabPanels>
				<TabPanel className="flex flex-col gap-4 p-4">
					{todayNotes.map((note) => (
						<JournalEntry format="time" key={note.id} note={note} />
					))}
				</TabPanel>
				<TabPanel className="flex flex-col gap-4 p-4">
					{notes.map((note) => (
						<JournalEntry format="date" key={note.id} note={note} />
					))}
				</TabPanel>
			</TabPanels>
		</TabGroup>
	);
}

function JournalTab({ children }: { children: React.ReactNode }) {
	return (
		<Tab className="rounded-full px-3.5 py-2 text-white/70 transition-all active:scale-105 data-selected:bg-black/90 data-selected:text-white/90">
			{children}
		</Tab>
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
