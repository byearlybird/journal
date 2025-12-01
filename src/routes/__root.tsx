import { createRootRoute, Outlet } from "@tanstack/react-router";
import { DbProvider } from "@/app/providers/db-provider";
import { Navigation } from "@/components/layout/navigation";
import { useKeyboardHeight } from "@/lib/hooks";
import "@/app/app.css";

const RootComponent = () => {
	useKeyboardHeight();

	return (
		<DbProvider>
			<Navigation>
				<Outlet />
			</Navigation>
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
