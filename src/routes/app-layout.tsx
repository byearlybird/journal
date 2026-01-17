import { Navbar, type NavItemData, Sidebar } from "@app/components";
import { CreateDialog } from "@app/features/notes";
import { $router } from "@app/routes/_root";
import { useStore } from "@nanostores/react";
import { getPagePath } from "@nanostores/router";
import { BookOpenIcon, GearIcon } from "@phosphor-icons/react";
import { useState } from "react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const currentPage = useStore($router);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const navItems: NavItemData[] = [
    {
      href: getPagePath($router, "journal"),
      label: "Journal",
      icon: BookOpenIcon,
      isActive: currentPage?.route === "journal",
    },
    {
      href: getPagePath($router, "settings"),
      label: "Settings",
      icon: GearIcon,
      isActive: currentPage?.route === "settings",
    },
  ];

  return (
    <>
      <div className="grid h-screen grid-cols-5">
        <div className="hidden w-full md:block">
          <Sidebar navItems={navItems} onCreateClick={() => setIsCreateDialogOpen(true)} />
        </div>
        <div className="col-span-5 max-h-screen overflow-y-auto md:col-span-4">{children}</div>
        <div className="md:hidden">
          <Navbar navItems={navItems} onCreateClick={() => setIsCreateDialogOpen(true)} />
        </div>
      </div>
      <CreateDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
    </>
  );
}
