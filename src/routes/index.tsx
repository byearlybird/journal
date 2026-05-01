import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@nanostores/react";
import { Page, PageHeader, PageTitle } from "@/components/page-layout";
import { Entry } from "@/components/entry";
import { useTodayDate } from "@/hooks/use-today-date";
import { useEntriesOnDate } from "@/hooks/use-entries-on-date";
import { openEntryDetail } from "@/stores/entry-detail";
import { formatDate, formatWeekday, formatWeekdayShort } from "@/utils/dates";
import { $debouncedSearchTerm, $labelFilter } from "@/stores/entry-search";
import { $userSettings } from "@/stores/user-settings";
import { NoteIcon, XIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const date = useTodayDate();
  const searchTerm = useStore($debouncedSearchTerm);
  const labelFilter = useStore($labelFilter);
  const settings = useStore($userSettings);
  const entries = useEntriesOnDate(date, {
    searchTerm: searchTerm || undefined,
    labelName: labelFilter?.name,
  });

  function dismissLearn() {
    $userSettings.set({ ...$userSettings.get(), learnDismissed: true });
  }

  return (
    <Page>
      <PageHeader>
        <PageTitle>
          {formatDate(date)}{" "}
          <span className="ms-2 font-normal text-foreground-muted text-sm">
            <span className="sm:hidden">{formatWeekdayShort(date)}</span>
            <span className="hidden sm:inline">{formatWeekday(date)}</span>
          </span>
        </PageTitle>
      </PageHeader>
      {entries.map((entry) => (
        <Entry key={entry.id} {...entry} onClick={() => openEntryDetail(entry.id)} />
      ))}
      {entries.length === 0 && (
        <div className="text-foreground-muted/70 flex justify-center items-center flex-col space-y-2 flex-1 w-full">
          <NoteIcon weight="light" className="size-8" />
          <h2>No entries yet today</h2>
          {!settings.learnDismissed && (
            <div className="mt-6 flex items-center gap-1 text-sm">
              <Link
                to="/docs/$slug"
                params={{ slug: "philosophy" }}
                onClick={dismissLearn}
                className="underline underline-offset-2 hover:text-foreground transition-colors px-2 py-1"
              >
                New here? Read the Philosophy →
              </Link>
              <button
                onClick={dismissLearn}
                aria-label="Dismiss"
                className="rounded-md p-1 hover:bg-surface-tint hover:text-foreground transition-colors"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </Page>
  );
}
