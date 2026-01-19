import { Checkbox, Field, Label } from "@headlessui/react";
import type { Entry } from "./types";
import { isNoteEntry, isTaskEntry } from "./types";
import { format, parse, parseISO } from "date-fns";
import { CheckIcon } from "@phosphor-icons/react";
import { cx } from "cva";
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

    const handleChange = (checked: boolean) => {
      updateTaskStatus(entry.id, checked ? "complete" : "incomplete");
    };

    return (
      <div className="flex flex-col gap-2 py-4">
        <time className="text-sm text-white/70">{format(createdAt, "h:mm a")}</time>
        <Field className="flex gap-3 items-center">
          <Checkbox
            checked={isComplete}
            onChange={handleChange}
            className="group flex size-5 shrink-0 items-center justify-center rounded-full border border-white/30 transition-all hover:border-white/50 data-checked:border-white/50"
          >
            {isComplete && <CheckIcon className="size-3" weight="bold" />}
          </Checkbox>
          <Label className={cx(isComplete ? "text-white/50 line-through" : "text-white/90")}>
            {entry.content}
          </Label>
        </Field>
      </div>
    );
  }

  return null;
}
