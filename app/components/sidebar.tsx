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
export function Sidebar() {
	return (
		<div className="border-r border-white/10 h-full flex flex-col w-full">
			{/* <div className="border-b border-white/10 w-full p-4">
				<button
					type="button"
					onClick={() => openCreateDialog()}
					className="flex w-full gap-2 px-3 py-2 text-sm items-center justify-center rounded-sm bg-yellow text-black transition-transform duration-100 ease-in-out active:scale-105"
				>
					Create entry
					<PencilSimpleLineIcon className="size-4" />
				</button>
			</div> */}
			<div className="p-4 gap-3 flex flex-col">
				<button
					type="button"
					onClick={() => openCreateDialog()}
					className="flex px-1.5 py-1.5 items-center gap-2 rounded-md transition-transform duration-100 ease-in-out active:scale-110"
				>
					<span className="flex items-center justify-center rounded-full bg-yellow text-black p-1">
						<PencilSimpleLineIcon className="size-4" />
					</span>
					New entry
				</button>
				<NavItem page="journal" label="Journal" icon={BookOpenIcon} />
				<NavItem page="settings" label="Settings" icon={GearIcon} />
			</div>
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
				"flex items-center gap-3 rounded-md px-3 py-2 transition-transform duration-100 ease-in-out active:scale-110",
				isActive &&
					"border border-white/10 bg-white/10 text-white backdrop-blur",
			)}
		>
			<Icon className="size-4" />
			{label}
		</a>
	);
}
