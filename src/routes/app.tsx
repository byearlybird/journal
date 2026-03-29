import { ActionNavbar, Navbar, type NavItemData } from "@/components";
import type { Intention, Note, Tag, Task } from "@/models";
import { CreateDialog } from "@/components/entries";
import { QuickDrawer } from "@/components/quick-drawer";
import { getCurrentMonth } from "@/utils/date-utils";
import { TagFilterContext } from "@/contexts/tag-filter-context";
import {
  allTagsQueryOptions,
  intentionByMonthQueryOptions,
  pinnedNotesQueryOptions,
  tasksByStatusQueryOptions,
} from "@/queries";
import { BookOpenIcon, GearSixIcon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    const currentMonth = getCurrentMonth();
    await Promise.all([
      queryClient.ensureQueryData(tasksByStatusQueryOptions("incomplete")),
      queryClient.ensureQueryData(intentionByMonthQueryOptions(currentMonth)),
      queryClient.ensureQueryData(pinnedNotesQueryOptions()),
      queryClient.ensureQueryData(allTagsQueryOptions()),
    ]);
    return { month: currentMonth };
  },
});

function RouteComponent() {
  const { month } = Route.useLoaderData();
  const { data: incompleteTasks } = useSuspenseQuery(tasksByStatusQueryOptions("incomplete"));
  const { data: intention } = useSuspenseQuery(intentionByMonthQueryOptions(month));
  const { data: pinnedNotes } = useSuspenseQuery(pinnedNotesQueryOptions());
  const { data: allTags } = useSuspenseQuery(allTagsQueryOptions());

  const today = new Date().toLocaleDateString("en-CA");
  const todayTasks = incompleteTasks.filter((t) => t.date === today);
  const priorTasks = incompleteTasks.filter((t) => t.date < today);

  return (
    <AppLayout
      todayTasks={todayTasks}
      priorTasks={priorTasks}
      intention={intention ?? null}
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
      <CreateDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        allTags={allTags}
      />
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
