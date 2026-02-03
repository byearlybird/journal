import { getEntriesGroupedByDate } from "@app/features/entries/entries-loader";
import { DayEntriesItem } from "@app/features/entries";
import type { TimelineItem } from "@app/features/entries/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/app/entries")({
  component: RouteComponent,
  loader: async () => {
    const entriesByDate = await getEntriesGroupedByDate();
    return { entriesByDate };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { entriesByDate } = Route.useLoaderData();

  const handleEntryClick = (entry: TimelineItem) => {
    if (entry.type === "note") {
      navigate({
        to: "/note/$id",
        params: { id: entry.id },
        search: { from: "entries" },
        viewTransition: { types: ["slide-left"] },
      });
    } else if (entry.type === "task") {
      navigate({
        to: "/task/$id",
        params: { id: entry.id },
        search: { from: "entries" },
        viewTransition: { types: ["slide-left"] },
      });
    }
  };

  return (
    <div className="flex flex-col px-4 pt-2 divide-y divide-dashed *:not-first:pt-8">
      {Object.entries(entriesByDate).map(([date, entries]) => (
        <DayEntriesItem key={date} date={date} entries={entries} onEntryClick={handleEntryClick} />
      ))}
    </div>
  );
}
