import { createFileRoute } from "@tanstack/react-router";
import { DayNotesItem, useNotesGroupedByDate, useNotesToday } from "@app/features/notes";
import { TaskList, useTasksToday, useUpdateTaskStatus } from "@app/features/tasks";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { format } from "date-fns";
import { useRef } from "react";
import { Pill } from "@app/components/pill";

export const Route = createFileRoute("/")({
  component: JournalPage,
});

function JournalPage() {
  const scrollRef = useRef(null);
  const todayNotes = useNotesToday();
  const todayTasks = useTasksToday();
  const allNotes = useNotesGroupedByDate();
  const { mutate: updateTaskStatus } = useUpdateTaskStatus();

  return (
    <TabGroup defaultIndex={0}>
      <TabList className={"sticky top-0 z-10 flex gap-4 bg-graphite/80 px-4 py-2 backdrop-blur"}>
        <Tab as={Pill}>Today</Tab>
        <Tab as={Pill}>All Entries</Tab>
      </TabList>
      <TabPanels ref={scrollRef}>
        <TabPanel className="flex flex-col gap-4 px-4 py-2">
          {todayTasks.length > 0 && (
            <div className="flex flex-col gap-2 rounded-md border p-3">
              <TaskList tasks={todayTasks} onStatusChange={updateTaskStatus} />
            </div>
          )}
          {todayNotes.length > 0 ? (
            <DayNotesItem date={format(new Date(), "yyyy-MM-dd")} notes={todayNotes} />
          ) : (
            todayTasks.length === 0 && (
              <div className="flex size-full flex-col items-center justify-center">
                <p className="p-6 text-sm text-white/50">No entries yet today</p>
              </div>
            )
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
