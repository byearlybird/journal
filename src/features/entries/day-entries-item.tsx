import type { Entry } from "./types";
import { isNoteEntry, isTaskEntry } from "./types";
import { format, parse, parseISO } from "date-fns";
import { useUpdateTaskStatus, TaskItem } from "@app/features/tasks";
import { card } from "@app/styles/card";

export function DayEntriesItem({ entries, date }: { entries: Entry[]; date: string }) {
  // Parse date string (YYYY-MM-DD) as local date
  const dateObj = parse(date, "yyyy-MM-dd", new Date());
  return (
    <article className={card({ className: "flex flex-col gap-2" })}>
      <span className="flex items-baseline gap-3">
        <time className="font-medium text-lg">{format(dateObj, "MMM d")}</time>
        <span className="text-sm text-white/70">{format(dateObj, "EEE")}</span>
      </span>
      <div className="flex flex-col gap-2 divide-y divide-dashed divide-white/10">
        {entries.map((entry) => (
          <EntryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </article>
  );
}

function EntryItem({ entry }: { entry: Entry }) {
  const updateTaskStatus = useUpdateTaskStatus();
  // Parse ISO string to Date object for consistent local timezone formatting
  const createdAt = parseISO(entry.createdAt);

  if (isNoteEntry(entry)) {
    return (
      <div className="flex flex-col gap-2 py-4">
        <time className="text-sm text-white/70">{format(createdAt, "h:mm a")}</time>
        <p className="leading-relaxed">{entry.content}</p>
      </div>
    );
  }

  if (isTaskEntry(entry)) {
    return (
      <div className="flex flex-col gap-2 py-4">
        <time className="text-sm text-white/70">{format(createdAt, "h:mm a")}</time>
        <TaskItem task={entry} onStatusChange={updateTaskStatus} />
      </div>
    );
  }

  return null;
}
