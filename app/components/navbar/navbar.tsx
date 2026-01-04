import { store } from "@app/store";
import "./navbar.css";
import { $router } from "@app/routes/_root";
import { useStore } from "@nanostores/react";
import { type ConfigFromRouter, getPagePath } from "@nanostores/router";
import {
	BookOpenIcon,
	GearIcon,
	PencilSimpleLineIcon,
	type Icon,
} from "@phosphor-icons/react";

type RouterConfig = ConfigFromRouter<typeof $router>;
type RouteName = keyof RouterConfig;

export function Navbar() {
	return (
		<div className="navbar">
			<nav>
				<NavItem icon={BookOpenIcon} label="Journal" page="journal" />
				<NavItem icon={GearIcon} label="Settings" page="settings" />
			</nav>
			<button
				type="button"
				onClick={promptCreateEntry}
				className="action-button"
			>
				<PencilSimpleLineIcon />
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
		<a className="nav-item" href={href} data-active={isActive}>
			<Icon size={16} />
			{isActive ? label : null}
		</a>
	);
}

function promptCreateEntry() {
	const response = window.prompt("What's on your mind?");
	if (response && response.length > 0) {
		store.notes.add({
			content: response,
		});
	}
}
