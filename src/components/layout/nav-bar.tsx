import { Link } from "@tanstack/solid-router";
import { cx } from "cva";
import type { ComponentProps, JSX } from "solid-js";

export const NavBar = (props: ComponentProps<"nav">) => {
	return (
		<nav
			{...props}
			class={cx(
				"flex items-center bottom-[var(--safe-bottom)] fixed left-[var(--safe-left)] right-[var(--safe-right)]",
				"backdrop-blur flex items-center justify-between bg-white/20 rounded-full p-0.5 transition-all w-fit",
				props.class,
			)}
		/>
	);
};

type NavItemProps = {
	to: string;
	label: string;
	children: JSX.Element;
};

export const NavItem = (props: NavItemProps) => {
	return (
		<Link
			to={props.to}
			activeOptions={{ exact: true }}
			activeProps={{ "data-status": "active" }}
			inactiveProps={{ "data-status": "inactive" }}
			class={cx(
				"transition-all transition-discrete data-[status=active]:shadow data-[status=active]:outline-1 outline-white/20 data-[status=active]:text-amber-300 data-[status=active]:bg-white/10 flex items-center gap-1.5 rounded-full [&>svg]:size-4 [&:not([data-status=active])>[data-part=label]]:hidden py-2.5 px-3.5 min-w-11 min-h-11 active:scale-110",
			)}
		>
			{props.children}
			<span data-part="label" class="transition-discrete">
				{props.label}
			</span>
		</Link>
	);
};
