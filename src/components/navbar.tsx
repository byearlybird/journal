import { type Icon } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { cx } from "cva";

export type NavItemData = {
  href: string;
  label: string;
  icon: Icon;
  isActive: boolean;
};

type NavbarProps = {
  navItems: NavItemData[];
};

export function Navbar({ navItems }: NavbarProps) {
  return (
    <nav className="flex gap-1 rounded-lg border bg-black/80 p-0.5 backdrop-blur">
      {navItems.map((item) => (
        <NavItem key={item.href} {...item} />
      ))}
    </nav>
  );
}

function NavItem({ href, label, icon: Icon, isActive }: NavItemData) {
  return (
    <Link
      to={href}
      viewTransition
      className={cx(
        "flex items-center gap-2 rounded-md px-3 py-2 transition-transform duration-100 ease-in-out active:scale-95",
        isActive && "border bg-white/10 text-white backdrop-blur",
      )}
    >
      <Icon className="size-4" />
      {isActive ? label : null}
    </Link>
  );
}
