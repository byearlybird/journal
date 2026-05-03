import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@nanostores/react";
import { Page } from "@/components/page-layout";
import { Entry } from "@/components/entry";
import { MonthGroup } from "@/components/month-group";
import { Button } from "@/components/shared/button";
import { useEntries } from "@/hooks/use-entries";
import { useTodayDate } from "@/hooks/use-today-date";
import { openEntryDetail } from "@/stores/entry-detail";
import { formatDate, formatWeekday, formatWeekdayShort } from "@/utils/dates";
import { $debouncedSearchTerm, $labelFilter } from "@/stores/entry-search";
import { $userSettings } from "@/stores/user-settings";
import { ArrowDownIcon, ArrowUpIcon, NoteIcon, XIcon } from "@phosphor-icons/react";
import type { DBSchema } from "@/db/schema";

type TimelineView = DBSchema["timeline"];

const PAGE_SIZE = 500;

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const date = useTodayDate();
  const searchTerm = useStore($debouncedSearchTerm);
  const labelFilter = useStore($labelFilter);
  const settings = useStore($userSettings);

  const [limit, setLimit] = useState(PAGE_SIZE);
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [searchTerm, labelFilter?.name]);

  const fetched = useEntries({
    searchTerm: searchTerm || undefined,
    labelName: labelFilter?.name,
    limit: limit + 1,
  });
  const hasMore = (fetched?.length ?? 0) > limit;
  const entries = useMemo(() => (hasMore ? fetched?.slice(0, limit) : fetched), [fetched, hasMore, limit]);

  const isFiltering = !!searchTerm || !!labelFilter;
  const scrollRef = useRef<HTMLDivElement>(null);
  const todaySentinelRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const [showBackToToday, setShowBackToToday] = useState(false);

  const { todayEntries, history } = useMemo(() => {
    const today: TimelineView[] = [];
    const earlier: TimelineView[] = [];
    for (const entry of entries ?? []) {
      if (entry.created_at.startsWith(date)) today.push(entry);
      else earlier.push(entry);
    }
    const months: Record<string, Record<string, TimelineView[]>> = {};
    for (const entry of earlier) {
      const month = entry.created_at.slice(0, 7);
      const day = entry.created_at.slice(0, 10);
      const days = (months[month] ??= {});
      (days[day] ??= []).push(entry);
    }
    const grouped = Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, days]) => ({
        month,
        days: Object.entries(days)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([d, dayEntries]) => ({ date: d, entries: dayEntries })),
      }));
    return { todayEntries: today, history: grouped };
  }, [entries, date]);

  useEffect(() => {
    if (isFiltering) {
      setShowBackToToday(false);
      return;
    }
    const sentinel = todaySentinelRef.current;
    const root = scrollRef.current;
    if (!sentinel || !root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBackToToday(!entry.isIntersecting),
      { root, threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isFiltering]);

  function loadMore() {
    setLimit((l) => l + PAGE_SIZE);
  }

  function dismissLearn() {
    $userSettings.set({ ...$userSettings.get(), learnDismissed: true });
  }

  function scrollToToday() {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToHistory() {
    historyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Page ref={scrollRef}>
      {isFiltering ? (
        <FilteredResults entries={entries ?? []} />
      ) : (
        <>
          <div ref={todaySentinelRef} />
          <div className="min-h-full flex flex-col">
            <div className="flex-1 flex flex-col">
              <div className="px-3 pt-2 pb-4">
                <h1 className="text-xl font-semibold shrink-0 whitespace-nowrap">
                  {formatDate(date)}{" "}
                  <span className="ms-2 font-normal text-foreground-muted text-sm">
                    <span className="md:hidden">{formatWeekdayShort(date)}</span>
                    <span className="hidden md:inline">{formatWeekday(date)}</span>
                  </span>
                </h1>
              </div>

              {todayEntries.length === 0 ? (
                <TodayEmptyState
                  learnDismissed={settings.learnDismissed}
                  onDismiss={dismissLearn}
                />
              ) : (
                todayEntries.map((entry) => (
                  <Entry key={entry.id} {...entry} onClick={() => openEntryDetail(entry.id)} />
                ))
              )}
            </div>

            {history.length > 0 && (
              <button
                type="button"
                onClick={scrollToHistory}
                className="mt-6 flex items-center gap-3 px-3 group cursor-default hover:bg-surface-tint/70 rounded-lg p-2"
              >
                <span className="flex gap-2 items-center text-xs uppercase tracking-wider text-foreground-muted group-hover:text-foreground-muted/80 transition-colors">
                  Earlier
                </span>
                <div className="flex-1 border-t border-dashed border-border group-hover:border-border transition-colors" />
                <ArrowDownIcon className="size-4 text-foreground-muted" />
              </button>
            )}
          </div>

          <div ref={historyRef}>
            {history.map((group) => (
              <MonthGroup
                key={group.month}
                month={group.month}
                days={group.days}
                onSelect={(entry) => openEntryDetail(entry.id)}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={scrollToToday}
            inert={!showBackToToday}
            className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-surface shadow-md transition-opacity duration-200 ${
              showBackToToday ? "opacity-100" : "opacity-0"
            }`}
          >
            <ArrowUpIcon />
            Today
          </Button>
        </>
      )}
      {hasMore && (
        <div className="flex justify-center pt-6 pb-12">
          <Button variant="outline" onClick={loadMore}>
            Load more
          </Button>
        </div>
      )}
    </Page>
  );
}

function FilteredResults({ entries }: { entries: TimelineView[] }) {
  if (entries.length === 0) {
    return (
      <div className="text-foreground-muted/70 flex justify-center items-center flex-col space-y-2 size-full">
        <NoteIcon weight="light" className="size-8" />
        <h2>No matching entries</h2>
      </div>
    );
  }
  return (
    <div className="px-1">
      {entries.map((entry) => (
        <Entry key={entry.id} {...entry} onClick={() => openEntryDetail(entry.id)} />
      ))}
    </div>
  );
}

type TodayEmptyStateProps = {
  learnDismissed: boolean;
  onDismiss: () => void;
};

function TodayEmptyState({ learnDismissed, onDismiss }: TodayEmptyStateProps) {
  return (
    <div className="text-foreground-muted/70 flex justify-center items-center flex-col space-y-2 flex-1 w-full">
      <NoteIcon weight="light" className="size-8" />
      <h2>No entries yet today</h2>
      {!learnDismissed && (
        <div className="mt-6 flex items-center gap-1 text-sm">
          <Link
            to="/docs/$slug"
            params={{ slug: "philosophy" }}
            onClick={onDismiss}
            className="underline underline-offset-2 hover:text-foreground transition-colors px-2 py-1"
          >
            New here? Read the Philosophy →
          </Link>
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="rounded-md p-1 hover:bg-surface-tint hover:text-foreground transition-colors"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
