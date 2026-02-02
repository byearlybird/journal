import { createFileRoute } from "@tanstack/react-router";
import { useEntriesToday } from "@app/features/entries";
import { Timeline } from "@app/features/entries/timeline";
import { formatDayOfWeek, formatMonthDate } from "@app/utils/date-utils";

export const Route = createFileRoute("/")({
  component: JournalPage,
});

function JournalPage() {
  const { data: todayEntries = [] } = useEntriesToday();

  return (
    <div className="px-4 py-2 space-y-4">
      <h1 className="text-2xl font-bold sticky flex items-baseline top-0 backdrop-blur-md bg-graphite py-1 gap-2">
        {formatMonthDate(new Date())}
        <span className="text-sm text-white/70">{formatDayOfWeek(new Date())}</span>
      </h1>
      <Timeline entries={todayEntries} />
    </div>
  );
}
