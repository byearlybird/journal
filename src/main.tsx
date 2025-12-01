import { createRouter, RouterProvider } from "@tanstack/solid-router";
import { render } from "solid-js/web";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
});

declare module "@tanstack/solid-router" {
	interface Register {
		router: typeof router;
	}
}

const rootElement = document.getElementById("app");

if (!rootElement) {
	throw new Error("App root element not found");
}

if (!rootElement.innerHTML) {
	render(() => <RouterProvider router={router} />, rootElement);
}
