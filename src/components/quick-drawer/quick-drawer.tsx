import type { Goal, Intention, Task } from "@/models";
import {
  DrawerContent,
  DrawerRoot,
  DrawerTab,
  DrawerTabList,
  DrawerTabPanel,
  DrawerTabRoot,
  DrawerTitle,
} from "@/components/common/drawer";
import { TaskTab } from "./task-tab";
import { MonthlyTab } from "./monthly-tab";

export function QuickDrawer({
  todayTasks,
  priorTasks,
  intention,
  goals,
  month,
  open,
  onClose,
}: {
  todayTasks: Task[];
  priorTasks: Task[];
  intention: Intention | null;
  goals: Goal[];
  month: string;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <DrawerRoot open={open} onOpenChange={onClose} swipeDirection="down">
      <DrawerContent>
        <DrawerTitle>Tasks</DrawerTitle>
        <DrawerTabRoot defaultValue="tasks">
          <DrawerTabList>
            <DrawerTab value="tasks">Tasks</DrawerTab>
            <DrawerTab value="monthly">Month</DrawerTab>
          </DrawerTabList>
          <DrawerTabPanel value="tasks">
            <TaskTab todayTasks={todayTasks} priorTasks={priorTasks} open={open} />
          </DrawerTabPanel>
          <DrawerTabPanel value="monthly">
            <MonthlyTab intention={intention} goals={goals} month={month} />
          </DrawerTabPanel>
        </DrawerTabRoot>
      </DrawerContent>
    </DrawerRoot>
  );
}
