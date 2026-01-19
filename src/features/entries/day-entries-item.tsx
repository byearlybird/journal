import type { Entry } from "./types";
import { isNoteEntry, isTaskEntry } from "./types";
import { format, parse, parseISO } from "date-fns";
import { CheckIcon } from "@phosphor-icons/react";
import { useUpdateTaskStatus } from "./use-entries";

export function DayEntriesItem({ entries, date }: { entries: Entry[]; date: string }) {
  // Parse date string (YYYY-MM-DD) as local date
  const dateObj = parse(date, "yyyy-MM-dd", new Date());
  return (
    <article className="flex flex-col gap-2 rounded-md border p-4">
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
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();
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
    const isComplete = entry.status === "complete";

    const toggleComplete = () => {
      updateTaskStatus(entry.id, isComplete ? "incomplete" : "complete");
    };

    return (
      <div className="flex flex-col gap-2 py-4">
        <time className="text-sm text-white/70">{format(createdAt, "h:mm a")}</time>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={toggleComplete}
            className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border border-white/30 transition-all hover:border-white/50"
          >
            {isComplete && <CheckIcon className="size-3" weight="bold" />}
          </button>
          <p className={isComplete ? "text-white/50 line-through" : ""}>{entry.content}</p>
        </div>
      </div>
    );
  }

  return null;
}
