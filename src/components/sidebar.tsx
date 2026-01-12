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
		<div className="flex h-full w-full flex-col border-r">
			<div className="flex h-full flex-col gap-3 p-4">
				<button
					type="button"
					onClick={() => openCreateDialog()}
					className="flex items-center gap-2 rounded-md px-1.5 py-1.5 transition-transform duration-100 ease-in-out active:scale-110"
				>
					<span className="flex items-center justify-center rounded-full bg-yellow p-1 text-black">
						<PencilSimpleLineIcon className="size-4" />
					</span>
					New entry
				</button>
				<NavItem page="journal" label="Journal" icon={BookOpenIcon} />
				<div className="mt-auto">
					<NavItem page="settings" label="Settings" icon={GearIcon} />
				</div>
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
				isActive && "border bg-white/10 text-white backdrop-blur",
			)}
		>
			<Icon className="size-4" />
			{label}
		</a>
	);
}
