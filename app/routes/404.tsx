import { NotFound } from "@app/components/pages/not-found.page";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const notFoundRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "*",
	component: NotFoundComponent,
});

function NotFoundComponent() {
	return <NotFound />;
}