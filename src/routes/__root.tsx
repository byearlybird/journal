import { Navbar, type NavItemData } from "@app/components";
import { CreateDialog } from "@app/features/entries";
import { useRouterState } from "@tanstack/react-router";
import { BookOpenIcon, GearIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { SyncProvider } from "@app/features/sync";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <SyncProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </SyncProvider>
  );
}

function NotFoundComponent() {
  return <div className="mx-auto max-w-3xl p-4 text-white">404 - Page not found</div>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const navItems: NavItemData[] = [
    {
      href: "/",
      label: "Journal",
      icon: BookOpenIcon,
      isActive: pathname === "/",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: GearIcon,
      isActive: pathname === "/settings",
    },
  ];

  return (
    <>
      <div className="flex h-screen flex-col max-w-2xl mx-auto">
        <div className="flex-1 overflow-y-auto pb-20">{children}</div>
        <Navbar navItems={navItems} onCreateClick={() => setIsCreateDialogOpen(true)} />
      </div>
      <CreateDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
    </>
  );
}
