import { ActionNavbar, Navbar, type NavItemData } from "@app/components";
import { CreateDialog } from "@app/features/entries";
import { TasksDialog } from "@app/features/tasks";
import { useRouterState } from "@tanstack/react-router";
import { ListBulletsIcon, SunHorizonIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPushpinDialogOpen, setIsPushpinDialogOpen] = useState(false);

  const navItems: NavItemData[] = [
    {
      href: "/app",
      label: "Today",
      icon: SunHorizonIcon,
      isActive: pathname === "/app",
    },
    {
      href: "/app/entries",
      label: "All Entries",
      icon: ListBulletsIcon,
      isActive: pathname === "/app/entries",
    },
  ];

  return (
    <>
      <div className="flex h-screen flex-col max-w-2xl mx-auto pt-safe-top">
        <div className="flex-1 overflow-y-auto pb-20">{children}</div>
        <div className="fixed left-[max(var(--safe-left),0.5rem)] bottom-[max(var(--safe-bottom),0.5rem)]">
          <Navbar navItems={navItems} />
        </div>
        <ActionNavbar
          onCreateClick={() => setIsCreateDialogOpen(true)}
          onPushpinClick={() => setIsPushpinDialogOpen(true)}
        />
      </div>
      <CreateDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
      <TasksDialog open={isPushpinDialogOpen} onClose={() => setIsPushpinDialogOpen(false)} />
    </>
  );
}
