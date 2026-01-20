import { createFileRoute } from "@tanstack/react-router";
import { DayNotesItem, useNotesToday } from "@app/features/notes";
import { useEntriesGroupedByDate, DayEntriesItem } from "@app/features/entries";
import {
  TaskItem,
  useTasksToday,
  useIncompletePastDueTasks,
  useUpdateTaskStatus,
} from "@app/features/tasks";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { format } from "date-fns";

export const Route = createFileRoute("/")({
  component: JournalPage,
});

function JournalPage() {
  const todayNotes = useNotesToday();
  const todayTasks = useTasksToday();
  const pastDueTasks = useIncompletePastDueTasks();
  const allEntries = useEntriesGroupedByDate();
  const updateTaskStatus = useUpdateTaskStatus();

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
        <TabPanel className="px-4 py-2 max-w-6xl">
          <div className="flex flex-col gap-4">
            {/* Tasks section */}
            {(pastDueTasks.length > 0 || todayTasks.length > 0) && (
              <div className="flex w-full flex-col gap-4">
                {todayTasks.length > 0 && (
                  <div className="flex flex-col gap-2 rounded-md border p-3">
                    <div className="flex flex-col gap-2 divide-y divide-dashed divide-white/10">
                      {todayTasks.map((task) => (
                        <div key={task.id} className="py-2">
                          <TaskItem task={task} onStatusChange={updateTaskStatus} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {pastDueTasks.length > 0 && (
                  <div className="flex flex-col gap-2 rounded-md border p-3">
                    <h2 className="text-sm font-medium text-white/50">From previous days</h2>
                    <div className="flex flex-col gap-2 divide-y divide-dashed divide-white/10">
                      {pastDueTasks.map((task) => (
                        <div key={task.id} className="py-2">
                          <TaskItem task={task} onStatusChange={updateTaskStatus} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
        <TabPanel className="flex flex-col gap-4 p-4 max-w-3xl">
          {Object.entries(allEntries).map(([date, entries]) => (
            <DayEntriesItem key={date} date={date} entries={entries} />
          ))}
        </TabPanel>
      </TabPanels>
    </TabGroup>
  );
}
