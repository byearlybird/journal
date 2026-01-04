import { useNotes, useTodayNotes } from "@app/store/queries";
import { Tabs } from "@base-ui/react/tabs";

export function JournalPage() {
	const notes = useNotes();
	const todayNotes = useTodayNotes();

	return (
		<Tabs.Root defaultValue="today">
			<Tabs.List className="flex gap-4 p-4">
				<Tabs.Tab value="today" className="data-active:font-bold">
					Today
				</Tabs.Tab>
				<Tabs.Tab value="all" className="data-active:font-bold">
					All
				</Tabs.Tab>
			</Tabs.List>
			<Tabs.Panel value="today" className="flex flex-col gap-4 p-4">
				{todayNotes.map((note) => (
					<article
						key={note.id}
						className="flex rounded border border-white bg-black p-4"
					>
						{note.content}
					</article>
				))}
			</Tabs.Panel>
			<Tabs.Panel value="all" className="flex flex-col gap-4 p-4">
				{notes.map((note) => (
					<article
						key={note.id}
						className="flex rounded border border-white bg-black p-4"
					>
						{note.content}
					</article>
				))}
			</Tabs.Panel>
		</Tabs.Root>
	);
}
