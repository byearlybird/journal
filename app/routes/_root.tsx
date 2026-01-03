import { HomePage } from "@app/components/home-page/home-page";
import { NotFound } from "@app/components/not-found-page/not-found-page";
import { usePersistence } from "@app/store/persistence";
import { useSync } from "@app/store/sync";
import { useStore } from "@nanostores/react";
import { createRouter } from "@nanostores/router";

export const $router = createRouter({
	home: "/",
});

export function Root() {
	usePersistence();
	useSync();

	return (
		<GlobalLayout>
			<Content />
		</GlobalLayout>
	);
}

function GlobalLayout({ children }: { children: React.ReactNode }) {
	return <>{children}</>;
}

function Content() {
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
