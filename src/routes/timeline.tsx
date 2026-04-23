import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Page } from "@/components/page-layout";
import { EntryGroup } from "@/components/entry-group";
import { EntryDetail } from "@/components/entry-detail";
import type { DBSchema } from "@/db/schema";
import { useEntries } from "@/hooks/use-entries";

type TimelineView = DBSchema["timeline"];

export const Route = createFileRoute("/timeline")({
  component: TimelinePage,
});

function TimelinePage() {
  const [selected, setSelected] = useState<TimelineView | null>(null);
  const entries = useEntries();
  const groupedEntries = useMemo(() => {
    const groups: Record<string, TimelineView[]> = {};
    for (const entry of entries ?? []) {
      const date = entry.created_at.slice(0, 10);
      (groups[date] ??= []).push(entry);
    }
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, entries]) => ({ date, entries }));
  }, [entries]);

  return (
    <Page>
      {groupedEntries.map((group) => (
        <EntryGroup
          key={group.date}
          date={group.date}
          entries={group.entries}
          onSelect={setSelected}
        />
      ))}
      <EntryDetail
        entry={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </Page>
  );
}
