import { getEntriesGroupedByDate } from "@/app/features/entries/entries-loader";
import { DayEntriesItem } from "@/app/features/entries";
import type { TimelineItem } from "@/app/features/entries/types";
import { useLocalData } from "@/app/hooks/use-local-data";
import { navigate } from "@/app/utils/navigate";

export function EntriesPage() {
  const entriesByDate = useLocalData(() => getEntriesGroupedByDate());

  const handleEntryClick = (entry: TimelineItem) => {
    if (entry.type === "note") {
      navigate("note", { id: entry.id }, { search: { from: "entries" }, transition: "slide-left" });
    } else if (entry.type === "task") {
      navigate("task", { id: entry.id }, { search: { from: "entries" }, transition: "slide-left" });
    }
  };

  if (!entriesByDate) return null;

  return (
    <div className="flex flex-col px-4 pt-2 divide-y divide-dashed *:not-first:pt-8">
      {Object.entries(entriesByDate).length === 0 && (
        <div className="flex flex-col items-center justify-center h-full pt-24">
          <p className="text-sm text-cloud-light">No entries yet</p>
        </div>
      )}
      {Object.entries(entriesByDate).map(([date, entries]) => (
        <DayEntriesItem key={date} date={date} entries={entries} onEntryClick={handleEntryClick} />
      ))}
    </div>
  );
}
