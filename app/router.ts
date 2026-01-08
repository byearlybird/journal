import { createRouter, RouterProvider } from "@tanstack/react-router";
import { rootRoute } from "./routes/__root";
import { indexRoute } from "./routes/index";
import { settingsRoute } from "./routes/settings";
import { notFoundRoute } from "./routes/404";

// Build route tree manually from file-based routes
const routeTree = rootRoute.addChildren([
	indexRoute,
	settingsRoute,
	notFoundRoute,
]);

// Create a new router instance
export const router = createRouter({
	routeTree,
	defaultPreload: "intent",
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

export { RouterProvider };