import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Page, PageHeader, PageTitle } from "@/components/page-layout";
import { Entry } from "@/components/entry";
import { EntryDetail } from "@/components/entry-detail";
import type { DBSchema } from "@/db/schema";
import { useTodayDate } from "@/hooks/use-today-date";
import { useEntriesOnDate } from "@/hooks/use-entries-on-date";
import { formatDate } from "@/utils/dates";

type TimelineView = DBSchema["timeline"];

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const [selected, setSelected] = useState<TimelineView | null>(null);
  const date = useTodayDate();
  const entries = useEntriesOnDate(date);

  return (
    <Page>
      <PageHeader>
        <PageTitle>{formatDate(date)}</PageTitle>
      </PageHeader>
      {entries.map((entry) => (
        <Entry key={entry.id} {...entry} onClick={() => setSelected(entry)} />
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
