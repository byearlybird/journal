import { SyncProvider } from "@app/features/sync";
import { AppLayout } from "@app/routes/app-layout";
import { JournalPage } from "@app/routes/journal-page";
import { NotFound } from "@app/routes/not-found-page";
import { SettingsPage } from "@app/routes/settings-page";
import { useStore } from "@nanostores/react";
import { createRouter } from "@nanostores/router";

export const $router = createRouter({
	journal: "/",
	settings: "/settings",
});

export function Root() {
	return (
		<SyncProvider>
			<AppLayout>
				<Content />
			</AppLayout>
		</SyncProvider>
	);
}

function Content() {
	const page = useStore($router);

	switch (page?.route) {
		case undefined:
			return <NotFound />;
		case "journal":
			return <JournalPage />;
		case "settings":
			return <SettingsPage />;
		default:
			return null;
	}
}
