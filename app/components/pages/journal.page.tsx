import { useNotes } from "@app/store/queries";
import "./journal.page.css";

export function JournalPage() {
	const notes = useNotes();

	return (
		<div className="journal-page">
			{notes.map((note) => (
				<article key={note.id}>{note.content}</article>
			))}
		</div>
	);
}
