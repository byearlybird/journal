import { PencilSimpleLineIcon } from "@phosphor-icons/react";
import clsx from "clsx";
import type { NavItemData } from "./navbar";

type SidebarProps = {
  navItems: NavItemData[];
  onCreateClick: () => void;
};

export function Sidebar({ navItems, onCreateClick }: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col border-r">
      <div className="flex h-full flex-col gap-3 p-4">
        <button
          type="button"
          onClick={onCreateClick}
          className="flex items-center gap-2 rounded-md px-1.5 py-1.5 transition-transform duration-100 ease-in-out active:scale-105"
        >
          <span className="flex items-center justify-center rounded-full bg-yellow p-1 text-black">
            <PencilSimpleLineIcon className="size-4" />
          </span>
          New entry
        </button>
        {navItems.map((item, index) =>
          index === navItems.length - 1 ? (
            <div key={item.href} className="mt-auto">
              <NavItem {...item} />
            </div>
          ) : (
            <NavItem key={item.href} {...item} />
          ),
        )}
      </div>
    </div>
  );
}

function NavItem({ href, label, icon: Icon, isActive }: NavItemData) {
  return (
    <a
      href={href}
      className={clsx(
        "flex items-center gap-3 rounded-md px-3 py-2 transition-transform duration-100 ease-in-out active:scale-105",
        isActive && "border bg-white/10 text-white backdrop-blur",
      )}
    >
      <Icon className="size-4" />
      {label}
    </a>
  );
}
