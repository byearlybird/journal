import { type Icon, PencilSimpleLineIcon } from "@phosphor-icons/react";
import clsx from "clsx";

export type NavItemData = {
	href: string;
	label: string;
	icon: Icon;
	isActive: boolean;
};

type NavbarProps = {
	navItems: NavItemData[];
	onCreateClick: () => void;
};

export function Navbar({ navItems, onCreateClick }: NavbarProps) {
	return (
		<div className="fixed right-[max(var(--safe-right),0.5rem)] bottom-[max(var(--safe-bottom),0.5rem)] left-[max(var(--safe-left),0.5rem)] flex justify-between">
			<nav className="flex gap-1 rounded-lg border bg-black/80 p-0.5 backdrop-blur">
				{navItems.map((item) => (
					<NavItem key={item.href} {...item} />
				))}
			</nav>
			<button
				type="button"
				onClick={onCreateClick}
				className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow text-black transition-transform duration-100 ease-in-out active:scale-110"
			>
				<PencilSimpleLineIcon className="size-4" />
			</button>
		</div>
	);
}

function NavItem({ href, label, icon: Icon, isActive }: NavItemData) {
	return (
		<a
			href={href}
			className={clsx(
				"flex items-center gap-2 rounded-md px-3 py-2 transition-transform duration-100 ease-in-out active:scale-110",
				isActive && "border bg-white/10 text-white backdrop-blur",
			)}
		>
			<Icon className="size-4" />
			{isActive ? label : null}
		</a>
	);
}
