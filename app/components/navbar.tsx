import { $router } from "@app/routes/_root";
import { useStore } from "@nanostores/react";
import { type ConfigFromRouter, getPagePath } from "@nanostores/router";
import {
	BookOpenIcon,
	GearIcon,
	type Icon,
	PencilSimpleLineIcon,
} from "@phosphor-icons/react";
import clsx from "clsx";
import { openCreateDialog } from "./create-dialog";

type RouterConfig = ConfigFromRouter<typeof $router>;
type RouteName = keyof RouterConfig;

export function Navbar() {
	return (
		<div className="fixed right-[max(var(--safe-right),0.5rem)] bottom-[max(var(--safe-bottom),0.5rem)] left-[max(var(--safe-left),0.5rem)] flex justify-between">
			<nav className="flex gap-1 rounded-lg border border-white/10 bg-[#191919]/80 p-0.5 backdrop-blur">
				<NavItem icon={BookOpenIcon} label="Journal" page="journal" />
				<NavItem icon={GearIcon} label="Settings" page="settings" />
			</nav>
			<button
				type="button"
				onClick={() => openCreateDialog()}
				className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow text-black transition-transform duration-100 ease-in-out active:scale-110"
			>
				<PencilSimpleLineIcon className="size-4" />
			</button>
		</div>
	);
}

function NavItem({
	page,
	label,
	icon: Icon,
}: {
	page: RouteName;
	label: string;
	icon: Icon;
}) {
	const currentPage = useStore($router);
	const href = getPagePath($router, page);
	const isActive = currentPage?.route === page;

	return (
		<a
			href={href}
			className={clsx(
				"flex items-center gap-2 rounded-md px-3 py-2 transition-transform duration-100 ease-in-out active:scale-110",
				isActive &&
					"border border-white/10 bg-white/10 text-white backdrop-blur",
			)}
		>
			<Icon className="size-4" />
			{isActive ? label : null}
		</a>
	);
}
