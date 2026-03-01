import { type Icon } from "@phosphor-icons/react";
import { useStore } from "@nanostores/react";
import { cx } from "cva";
import { $router } from "@/stores/router";
import { navigate } from "@/utils/navigate";

export type NavItemData = {
  route: string;
  label: string;
  icon: Icon;
};

type NavbarProps = {
  navItems: NavItemData[];
};

export function Navbar({ navItems }: NavbarProps) {
  return (
    <nav className="flex gap-1 rounded-lg border bg-slate-dark p-0.5 backdrop-blur">
      {navItems.map((item) => (
        <NavItem key={item.route} {...item} />
      ))}
    </nav>
  );
}

function NavItem({ route, label, icon: Icon }: NavItemData) {
  const page = useStore($router);
  const isActive = page?.route === route;

  const handleClick = () => {
    navigate(route as any);
  };

  return (
    <button
      onClick={handleClick}
      className={cx(
        "flex items-center gap-2 rounded-md px-3 py-2 transition-transform duration-100 ease-in-out active:scale-105 [&>svg]:size-4",
        isActive && "border bg-slate-light text-ivory-light backdrop-blur",
      )}
    >
      <Icon className="size-4" />
      {isActive ? label : null}
    </button>
  );
}
