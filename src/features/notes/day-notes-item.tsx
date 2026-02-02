import type { Note } from "@app/db";
import { parse, parseISO } from "date-fns";
import { formatMonthDate, formatDayOfWeek, formatTime } from "@app/utils/date-utils";

export function DayNotesItem({ notes, date }: { notes: Note[]; date: string }) {
  // Parse date string (YYYY-MM-DD) as local date
  const dateObj = parse(date, "yyyy-MM-dd", new Date());
  return (
    <article className="border rounded-md p-4 flex flex-col gap-2">
      <span className="flex items-baseline gap-3">
        <time className="font-medium text-lg">{formatMonthDate(dateObj)}</time>
        <span className="text-sm text-white/70">{formatDayOfWeek(dateObj)}</span>
      </span>
      <div className="flex flex-col gap-2 divide-y divide-dashed divide-white/10">
        {notes.map((note) => (
          <NoteItem key={note.id} note={note} />
        ))}
      </div>
    </article>
  );
}

function NoteItem({ note }: { note: Note }) {
  // Parse ISO string to Date object for consistent local timezone formatting
  const createdAt = parseISO(note.created_at);
  return (
    <div className="flex flex-col gap-2 py-4">
      <time className="text-sm text-white/70">{formatTime(createdAt)}</time>
      <p className="leading-relaxed">{note.content}</p>
    </div>
  );
}
