import { useNotes, useTodayNotes } from "@app/store/queries";
import { Tabs } from "@base-ui/react/tabs";

export function JournalPage() {
	const notes = useNotes();
	const todayNotes = useTodayNotes();

	return (
		<Tabs.Root defaultValue="today">
			<Tabs.List className="flex gap-4 p-4">
				<Tabs.Tab
					value="today"
					className="rounded-full  px-4 py-1 text-white/70 data-active:text-white/90 data-active:bg-black/90"
				>
					Today
				</Tabs.Tab>
				<Tabs.Tab
					value="all"
					className="rounded-full  px-4 py-1 font-light text-white/70 data-active:text-white/90 data-active:bg-white/10"
				>
					All Entries
				</Tabs.Tab>
			</Tabs.List>
			<Tabs.Panel value="today" className="flex flex-col gap-4 p-4">
				{todayNotes.map((note) => (
					<article
						key={note.id}
						className="flex rounded-md border border-white/10 border-dashed p-4"
					>
						{note.content}
					</article>
				))}
			</Tabs.Panel>
			<Tabs.Panel value="all" className="flex flex-col gap-4 p-4">
				{notes.map((note) => (
					<article key={note.id} className="flex rounded-md bg-white/5 p-4">
						{note.content}
					</article>
				))}
			</Tabs.Panel>
		</Tabs.Root>
	);
}
