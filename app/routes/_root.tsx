import { usePersistence, useRemotePersistence } from "@app/store/sync-hooks";
import { useStore } from "@nanostores/react";
import { createRouter } from "@nanostores/router";
import { HomePage } from ".";

export const $router = createRouter({
	home: "/",
});

export function Root() {
	usePersistence();
	useRemotePersistence();

	const page = useStore($router);

	switch (page?.route) {
		case undefined:
			return <NotFound />;
		case "home":
			return <HomePage />;
		default:
			return null;
	}
}

function NotFound() {
	return (
		<div className="mx-auto max-w-3xl p-4 text-white">404 - Page not found</div>
	);
}
