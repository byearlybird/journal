import { createFileRoute } from "@tanstack/react-router";
import { DayNotesItem, useNotesToday } from "@app/features/notes";
import { useEntriesGroupedByDate, DayEntriesItem } from "@app/features/entries";
import { useTasksToday, useIncompletePastDueTasks } from "@app/features/tasks";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { format } from "date-fns";

export const Route = createFileRoute("/")({
  component: JournalPage,
});

function JournalPage() {
  const { data: todayNotes = [] } = useNotesToday();
  const { data: todayTasks = [] } = useTasksToday();
  const { data: pastDueTasks = [] } = useIncompletePastDueTasks();
  const { data: allEntries = {} } = useEntriesGroupedByDate();

  return (
    <TabGroup defaultIndex={0}>
      <TabList className={"sticky top-0 z-10 flex gap-4 bg-graphite/80 px-4 py-2 backdrop-blur"}>
        <Tab className="rounded-full px-3.5 py-2 text-white/70 transition-all active:scale-95 data-selected:bg-black/90 data-selected:text-white/90">
          Today
        </Tab>
        <Tab className="rounded-full px-3.5 py-2 text-white/70 transition-all active:scale-95 data-selected:bg-black/90 data-selected:text-white/90">
          All Entries
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel className="px-4 py-2">
          <div className="flex flex-col">
            {/* Notes section */}
            <div>
              {todayNotes.length > 0 ? (
                <DayNotesItem date={format(new Date(), "yyyy-MM-dd")} notes={todayNotes} />
              ) : (
                todayTasks.length === 0 &&
                pastDueTasks.length === 0 && (
                  <div className="flex size-full flex-col items-center justify-center">
                    <p className="p-6 text-sm text-white/50">No entries yet today</p>
                  </div>
                )
              )}
            </div>
          </div>
        </TabPanel>
        <TabPanel className="flex flex-col p-4">
          {Object.entries(allEntries).map(([date, entries]) => (
            <DayEntriesItem key={date} date={date} entries={entries} />
          ))}
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
