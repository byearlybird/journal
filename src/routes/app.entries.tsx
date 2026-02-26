import { useState } from "react";
import { getEntriesGroupedByDate } from "@app/features/entries/entries-loader";
import { DayEntriesItem } from "@app/features/entries";
import { ExportDialog } from "@app/features/entries/export-dialog";
import { ImportDialog } from "@app/features/entries/import-dialog";
import type { TimelineItem } from "@app/features/entries/types";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DownloadSimple, Export } from "@phosphor-icons/react";
import { Button as BaseButton } from "@base-ui/react";

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
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

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
      <div className="flex justify-end gap-1 pb-2">
        <BaseButton
          type="button"
          onClick={() => setIsImportDialogOpen(true)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-cloud-medium transition-all data-active:scale-105"
        >
          <DownloadSimple className="size-4" />
          Import
        </BaseButton>
        <BaseButton
          type="button"
          onClick={() => setIsExportDialogOpen(true)}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-cloud-medium transition-all data-active:scale-105"
        >
          <Export className="size-4" />
          Export
        </BaseButton>
      </div>
      {Object.entries(entriesByDate).length === 0 && (
        <div className="flex flex-col items-center justify-center h-full pt-24">
          <p className="text-sm text-cloud-light">No entries yet</p>
        </div>
      )}
      {Object.entries(entriesByDate).map(([date, entries]) => (
        <DayEntriesItem key={date} date={date} entries={entries} onEntryClick={handleEntryClick} />
      ))}
      <ImportDialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
      <ExportDialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)} />
    </div>
  );
}
