import type { Intention, Task } from "@/models";
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
import { PinnedTab } from "./pinned-tab";

export function QuickDrawer({
  todayTasks,
  priorTasks,
  intention,
  month,
  open,
  onClose,
}: {
  todayTasks: Task[];
  priorTasks: Task[];
  intention: Intention | null;
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
            <DrawerTab value="pinned">Pinned</DrawerTab>
          </DrawerTabList>
          <DrawerTabPanel value="tasks">
            <TaskTab todayTasks={todayTasks} priorTasks={priorTasks} open={open} />
          </DrawerTabPanel>
          <DrawerTabPanel value="pinned">
            <PinnedTab intention={intention} month={month} />
          </DrawerTabPanel>
        </DrawerTabRoot>
      </DrawerContent>
    </DrawerRoot>
  );
}
