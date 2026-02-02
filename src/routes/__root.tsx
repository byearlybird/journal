import { ActionNavbar, Navbar, type NavItemData } from "@app/components";
import { CreateDialog } from "@app/features/entries";
import { TasksDialog } from "@app/features/tasks";
import { useRouterState } from "@tanstack/react-router";
import { BookOpenIcon, GearIcon, ListBulletsIcon, SunHorizonIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function NotFoundComponent() {
  return <div className="mx-auto max-w-2xl p-4 text-white">404 - Page not found</div>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPushpinDialogOpen, setIsPushpinDialogOpen] = useState(false);

  const navItems: NavItemData[] = [
    {
      href: "/",
      label: "Today",
      icon: SunHorizonIcon,
      isActive: pathname === "/",
    },
    {
      href: "/all-entries",
      label: "All Entries",
      icon: ListBulletsIcon,
      isActive: pathname === "/all-entries",
    },
  ];

  return (
    <>
      <div className="flex h-screen flex-col max-w-2xl mx-auto pt-safe-top">
        <div className="flex-1 overflow-y-auto pb-20">{children}</div>
        <Navbar navItems={navItems} />
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
