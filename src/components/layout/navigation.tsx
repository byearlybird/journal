import { BookOpenIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { NavBar, NavItem } from "./nav-bar";

export const Navigation = (props: { children: ReactNode }) => {
	return (
		<>
			{props.children}
			<NavBar>
				<NavItem to="/" label="Journal">
					<BookOpenIcon />
				</NavItem>
				<NavItem to="/settings" label="Settings">
					<SlidersHorizontalIcon />
				</NavItem>
			</NavBar>
		</>
	);
};
