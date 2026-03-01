import { getEntriesToday } from "@app/features/entries/entries-loader";
import { Timeline } from "@app/features/entries/timeline";
import type { TimelineItem } from "@app/features/entries/types";
import { useLocalData } from "@app/hooks/use-local-data";
import { formatDayOfWeek, formatMonthDate } from "@app/utils/date-utils";
import { navigate } from "@app/utils/navigate";
import { SlidersHorizontalIcon } from "@phosphor-icons/react";

export function TodayPage() {
  const entries = useLocalData(() => getEntriesToday());
  const empty = !entries || entries.length === 0;

  const handleEntryClick = (entry: TimelineItem) => {
    if (entry.type === "note") {
      navigate("note", { id: entry.id }, { search: { from: "index" }, transition: "slide-left" });
    } else if (entry.type === "task") {
      navigate("task", { id: entry.id }, { search: { from: "index" }, transition: "slide-left" });
    }
  };

  return (
    <div className="px-4 py-2 space-y-4">
      <header className="sticky top-0 backdrop-blur-md bg-slate-medium py-1 flex justify-between items-center">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold">{formatMonthDate(new Date())}</span>
          <span className="font-bold text-sm text-cloud-light">{formatDayOfWeek(new Date())}</span>
        </div>
        <button type="button" onClick={() => navigate("settings", undefined, { transition: "slide-left" })}>
          <SlidersHorizontalIcon className="size-6 text-cloud-light" />
        </button>
      </header>
      {empty ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-cloud-light text-center pt-10">No entries yet today</p>
        </div>
      ) : (
        <Timeline entries={entries} onEntryClick={handleEntryClick} />
      )}
    </div>
  );
}
