import { BookOpenIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NavBar } from "@/components/layout";
import { DbProvider } from "@/lib/db/context";
import { useKeyboardHeightCssVar } from "@/lib/hooks";
import "@/app/app.css";

const RootComponent = () => {
	useKeyboardHeightCssVar("floating-input-height", "66vh");

	return (
		<DbProvider>
			<Outlet />
			<NavBar.Root>
				<NavBar.Item to="/" label="Journal">
					<BookOpenIcon />
				</NavBar.Item>
				<NavBar.Item to="/settings" label="Settings">
					<SlidersHorizontalIcon />
				</NavBar.Item>
			</NavBar.Root>
		</DbProvider>
	);
};

export const Route = createRootRoute({
	component: RootComponent,
	errorComponent: ({ error }) => (
		<div>
			<h1>Oops!</h1>
			<pre>{error.message}</pre>
		</div>
	),
});
