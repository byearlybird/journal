import type { Note as DbNote } from "@app/db/schema";
import { format, parse, parseISO } from "date-fns";

export function DayNotesItem({
	notes,
	date,
}: {
	notes: DbNote[];
	date: string;
}) {
	// Parse date string (YYYY-MM-DD) as local date
	const dateObj = parse(date, "yyyy-MM-dd", new Date());
	return (
		<article className="flex flex-col gap-2 rounded-md border p-4">
			<span className="flex items-baseline gap-3">
				<time className="font-medium text-lg">{format(dateObj, "MMM d")}</time>
				<span className="text-sm text-white/70">{format(dateObj, "EEE")}</span>
			</span>
			<div className="flex flex-col gap-2 divide-y divide-dashed divide-white/10">
				{notes.map((note) => (
					<NoteItem key={note.id} note={note} />
				))}
			</div>
		</article>
	);
}

function NoteItem({ note }: { note: DbNote }) {
	// Parse ISO string to Date object for consistent local timezone formatting
	const createdAt = parseISO(note.created_at);
	return (
		<div className="flex flex-col gap-2 py-4">
			<time className="text-sm text-white/70">
				{format(createdAt, "h:mm a")}
			</time>
			<p>{note.content}</p>
		</div>
	);
}
