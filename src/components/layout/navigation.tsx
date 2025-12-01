import { BookOpen, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { NavBar, NavItem } from "./nav-bar";

export const Navigation = (props: { children: ReactNode }) => {
	return (
		<>
			{props.children}
			<NavBar>
				<NavItem to="/" label="Journal">
					<BookOpen />
				</NavItem>
				<NavItem to="/settings" label="Settings">
					<SlidersHorizontal />
				</NavItem>
			</NavBar>
		</>
	);
};
