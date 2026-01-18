import { createFileRoute } from "@tanstack/react-router";
import { DayNotesItem, useNotesGroupedByDate, useNotesToday } from "@app/features/notes";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { format } from "date-fns";
import { useRef } from "react";

export const Route = createFileRoute("/")({
  component: JournalPage,
});

function JournalPage() {
  const scrollRef = useRef(null);
  const todayNotes = useNotesToday();
  const allNotes = useNotesGroupedByDate();

  return (
    <TabGroup defaultIndex={0}>
      <TabList className={"sticky top-0 z-10 flex gap-4 bg-graphite/80 px-4 py-2 backdrop-blur"}>
        <JournalTab>Today</JournalTab>
        <JournalTab>All Entries</JournalTab>
      </TabList>
      <TabPanels ref={scrollRef}>
        <TabPanel className="flex flex-col gap-4 p-4">
          {todayNotes.length > 0 ? (
            <DayNotesItem date={format(new Date(), "yyyy-MM-dd")} notes={todayNotes} />
          ) : (
            <div className="flex size-full flex-col items-center justify-center">
              <p className="p-6 text-sm text-white/50">No entries yet today</p>
            </div>
          )}
        </TabPanel>
        <TabPanel className="flex flex-col gap-4 p-4">
          {Object.entries(allNotes).map(([date, notes]) => (
            <DayNotesItem key={date} date={date} notes={notes} />
          ))}
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}

function JournalTab({ children }: { children: React.ReactNode }) {
  return (
    <Tab className="rounded-full px-3.5 py-2 text-white/70 transition-all active:scale-105 data-selected:bg-black/90 data-selected:text-white/90">
      {children}
    </Tab>
  );
}
