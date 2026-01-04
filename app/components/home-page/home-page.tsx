import { useNotes } from "@app/store/queries";
import "./home-page.css";

export function HomePage() {
	const notes = useNotes();

	return (
		<div className="home-page">
			<div className="home-page-notes">
				{notes.map((note) => (
					<div key={note.id} className="home-page-note">
						{note.content}
					</div>
				))}
			</div>
		</div>
	);
}
