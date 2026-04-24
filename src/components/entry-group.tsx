import type { DBSchema } from "@/db/schema";
import { formatDate, formatWeekday } from "@/utils/dates";
import { Entry } from "./entry";

type TimelineView = DBSchema["timeline"];

type EntryGroupProps = {
  date: string;
  entries: TimelineView[];
  onSelect?: (entry: TimelineView) => void;
};

export function EntryGroup({ date, entries, onSelect }: EntryGroupProps) {
  return (
    <div className="not-first:border-t border-dashed not-first:border-border/50 not-first:mt-4 not-first:pt-4">
      <h2 className="text-lg font-semibold px-2 py-1 mb-1 text-foreground">
        {formatDate(date)}{" "}
        <span className="ms-2 font-normal text-foreground-muted text-sm">
          {formatWeekday(date)}
        </span>
      </h2>
      {entries.map((entry) => (
        <Entry compact key={entry.id} {...entry} onClick={() => onSelect?.(entry)} />
      ))}
    </div>
  );
}
