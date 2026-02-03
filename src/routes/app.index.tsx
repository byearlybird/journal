import { getEntriesToday } from "@app/features/entries/entries-loader";
import { Timeline } from "@app/features/entries/timeline";
import type { TimelineItem } from "@app/features/entries/types";
import { formatDayOfWeek, formatMonthDate } from "@app/utils/date-utils";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: JournalPage,
  loader: async () => {
    const entries = await getEntriesToday();
    return { entries };
  },
});

function JournalPage() {
  const navigate = useNavigate();
  const { entries } = Route.useLoaderData();
  const empty = entries.length === 0;

  const handleEntryClick = (entry: TimelineItem) => {
    if (entry.type === "note") {
      navigate({
        to: "/note/$id",
        params: { id: entry.id },
        search: { from: "index" },
        viewTransition: { types: ["slide-left"] },
      });
    } else if (entry.type === "task") {
      navigate({
        to: "/task/$id",
        params: { id: entry.id },
        search: { from: "index" },
        viewTransition: { types: ["slide-left"] },
      });
    }
  };

  return (
    <div className="px-4 py-2 space-y-4">
      <h1 className="text-2xl font-bold sticky flex items-baseline top-0 backdrop-blur-md bg-slate-medium py-1 gap-2">
        {formatMonthDate(new Date())}
        <span className="text-sm text-cloud-light">{formatDayOfWeek(new Date())}</span>
      </h1>
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
