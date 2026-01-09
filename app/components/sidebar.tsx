import { useCryptoKey } from "@app/store/crypto-key";
import {
	BookOpenIcon,
	GearIcon,
	type Icon,
	PencilSimpleLineIcon,
} from "@phosphor-icons/react";
import { Link, useMatchRoute } from "@tanstack/react-router";
import clsx from "clsx";
import { openCreateDialog } from "./create-dialog";

export function Sidebar() {
	const { isOkay } = useCryptoKey();

	return (
		<div className="flex h-full w-full flex-col border-r">
			<div className="flex h-full flex-col gap-3 p-4">
				<button
					type="button"
					onClick={() => openCreateDialog()}
					disabled={!isOkay}
					className="flex items-center gap-2 rounded-md px-1.5 py-1.5 transition-transform duration-100 ease-in-out active:scale-110 disabled:opacity-50"
				>
					<span className="flex items-center justify-center rounded-full bg-yellow p-1 text-black">
						<PencilSimpleLineIcon className="size-4" />
					</span>
					New entry
				</button>
				<NavItem to="/" label="Journal" icon={BookOpenIcon} />
				<div className="mt-auto">
					<NavItem to="/settings" label="Settings" icon={GearIcon} />
				</div>
			</div>
		</div>
	);
}

function NavItem({
	to,
	label,
	icon: Icon,
}: {
	to: "/" | "/settings";
	label: string;
	icon: Icon;
}) {
	const matchRoute = useMatchRoute();
	const isActive = !!matchRoute({ to });

	return (
		<Link
			to={to}
			className={clsx(
				"flex items-center gap-3 rounded-md px-3 py-2 transition-transform duration-100 ease-in-out active:scale-110",
				isActive && "border bg-white/10 text-white backdrop-blur",
			)}
		>
			<Icon className="size-4" />
			{label}
		</Link>
	);
}
