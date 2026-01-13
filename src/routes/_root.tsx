import { Navbar, Sidebar } from "@app/components";
import { CreateDialog } from "@app/features/notes";
import { SyncProvider } from "@app/features/sync";
import { JournalPage } from "@app/pages/journal.page";
import { NotFound } from "@app/pages/not-found.page";
import { SettingsPage } from "@app/pages/settings.page";
import { useStore } from "@nanostores/react";
import { createRouter } from "@nanostores/router";

export const $router = createRouter({
	journal: "/",
	settings: "/settings",
});

export function Root() {
	return (
		<SyncProvider>
			<GlobalLayout>
				<Content />
			</GlobalLayout>
		</SyncProvider>
	);
}

function GlobalLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<div className="grid h-screen grid-cols-5">
				<div className="hidden w-full md:block">
					<Sidebar />
				</div>
				<div className="col-span-5 max-h-screen overflow-y-auto md:col-span-4">
					{children}
				</div>
				<div className="md:hidden">
					<Navbar />
				</div>
			</div>
			<CreateDialog />
		</>
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
