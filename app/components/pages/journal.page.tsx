import { useNotes } from "@app/store/queries";

export function JournalPage() {
	const notes = useNotes();

	return (
		<div className="flex flex-col gap-4 p-4">
			{notes.map((note) => (
				<article
					key={note.id}
					className="flex rounded border border-white bg-black p-4"
				>
					{note.content}
				</article>
			))}
		</div>
	);
}
