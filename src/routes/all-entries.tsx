import { DayEntriesItem, useEntriesGroupedByDate } from "@app/features/entries";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/all-entries")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: allEntries = {} } = useEntriesGroupedByDate();

  return (
    <div className="flex flex-col px-4 pt-2 divide-y divide-dashed *:not-first:pt-8">
      {Object.entries(allEntries).map(([date, entries]) => (
        <DayEntriesItem key={date} date={date} entries={entries} />
      ))}
    </div>
  );
}
