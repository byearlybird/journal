import { ActionNavbar, Navbar, type NavItemData } from "@/components";
import { tasksRepo, type Task } from "@/db";
import { CreateDialog } from "@/features/entries";
import { TasksDialog } from "@/features/tasks";
import { useLocalData } from "@/hooks/use-local-data";
import { compareDesc, parseISO } from "date-fns";
import { ListBulletsIcon, SunHorizonIcon } from "@phosphor-icons/react";
import { useState } from "react";

const navItems: NavItemData[] = [
  {
    route: "app",
    label: "Today",
    icon: SunHorizonIcon,
  },
  {
    route: "entries",
    label: "All Entries",
    icon: ListBulletsIcon,
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const tasks = useLocalData(() => tasksRepo.findAll());
  const incompleteTasks = (tasks ?? [])
    .filter((task: Task) => task.status === "incomplete")
    .sort((a: Task, b: Task) => compareDesc(parseISO(a.createdAt), parseISO(b.createdAt)));

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPushpinDialogOpen, setIsPushpinDialogOpen] = useState(false);

  return (
    <>
      <div className="flex h-screen flex-col max-w-2xl mx-auto pt-safe-top">
        <div className="flex-1 overflow-y-auto pb-20">{children}</div>
        <div className="fixed left-[max(var(--safe-left),1rem)] bottom-[max(var(--safe-bottom),1rem)]">
          <Navbar navItems={navItems} />
        </div>
        <ActionNavbar
          incompleteTasksCount={incompleteTasks.length}
          onCreateClick={() => setIsCreateDialogOpen(true)}
          onPushpinClick={() => setIsPushpinDialogOpen(true)}
        />
      </div>
      <CreateDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
      <TasksDialog
        incompleteTasks={incompleteTasks}
        open={isPushpinDialogOpen}
        onClose={() => setIsPushpinDialogOpen(false)}
      />
    </>
  );
}
