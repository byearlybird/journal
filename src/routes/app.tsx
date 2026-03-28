import { ActionNavbar, Navbar, type NavItemData } from "@/components";
import type { Intention, Note, Tag, Task } from "@/models";
import { CreateDialog } from "@/components/entries";
import { QuickDrawer } from "@/components/quick-drawer";
import { intentionService, noteService, tagService, taskService } from "@/app";
import { getCurrentMonth } from "@/utils/date-utils";
import { TagFilterContext } from "@/contexts/tag-filter-context";
import { BookOpenIcon, GearSixIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  loader: async () => {
    const currentMonth = getCurrentMonth();
    const [incompleteTasks, intention, pinnedNotes, allTags] = await Promise.all([
      taskService.getByStatus("incomplete"),
      intentionService.getByMonth(currentMonth),
      noteService.getPinned(),
      tagService.getAll(),
    ]);
    const today = new Date().toLocaleDateString("en-CA");
    const todayTasks = incompleteTasks.filter((t) => t.date === today);
    const priorTasks = incompleteTasks.filter((t) => t.date < today);
    return {
      todayTasks,
      priorTasks,
      intention: intention ?? null,
      month: currentMonth,
      pinnedNotes,
      allTags,
    };
  },
});

function RouteComponent() {
  const { todayTasks, priorTasks, intention, month, pinnedNotes, allTags } = Route.useLoaderData();
  return (
    <AppLayout
      todayTasks={todayTasks}
      priorTasks={priorTasks}
      intention={intention}
      month={month}
      pinnedNotes={pinnedNotes}
      allTags={allTags}
    >
      <Outlet />
    </AppLayout>
  );
}

function AppLayout({
  children,
  todayTasks,
  priorTasks,
  intention,
  month,
  pinnedNotes,
  allTags,
}: {
  children: React.ReactNode;
  todayTasks: Task[];
  priorTasks: Task[];
  intention: Intention | null;
  month: string;
  pinnedNotes: Note[];
  allTags: Tag[];
}) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPushpinDialogOpen, setIsPushpinDialogOpen] = useState(false);
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);

  const navItems: NavItemData[] = [
    {
      href: "/app",
      label: "Journal",
      icon: BookOpenIcon,
    },
    {
      href: "/app/settings",
      label: "Settings",
      icon: GearSixIcon,
    },
  ];

  return (
    <TagFilterContext.Provider value={[filterTagIds, setFilterTagIds]}>
      <div className="flex h-screen flex-col max-w-2xl mx-auto pt-safe-top">
        <div className="flex-1 overflow-hidden">{children}</div>
        <div className="fixed left-[max(var(--safe-left),1rem)] bottom-[max(var(--safe-bottom),1rem)]">
          <Navbar navItems={navItems} />
        </div>
        <ActionNavbar
          hasIncompleteTasks={todayTasks.length > 0 || priorTasks.length > 0}
          hasPriorTasks={priorTasks.length > 0}
          missingIntention={intention === null}
          onCreateClick={() => setIsCreateDialogOpen(true)}
          onPushpinClick={() => setIsPushpinDialogOpen(true)}
        />
      </div>
      <CreateDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} allTags={allTags} />
      <QuickDrawer
        todayTasks={todayTasks}
        priorTasks={priorTasks}
        intention={intention}
        month={month}
        pinnedNotes={pinnedNotes}
        open={isPushpinDialogOpen}
        onClose={() => setIsPushpinDialogOpen(false)}
      />
    </TagFilterContext.Provider>
  );
}
