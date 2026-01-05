import { CreateDialog } from "@app/components/create-dialog";
import { CryptoKeyGuard } from "@app/components/crypto-key-guard";
import { Navbar } from "@app/components/navbar";
import { JournalPage } from "@app/components/pages/journal.page";
import { NotFound } from "@app/components/pages/not-found.page";
import { SettingsPage } from "@app/components/pages/settings.page";
import { Sidebar } from "@app/components/sidebar";
import { usePersistence } from "@app/store/persistence";
import { useSync } from "@app/store/sync";
import { useStore } from "@nanostores/react";
import { createRouter } from "@nanostores/router";

export const $router = createRouter({
	journal: "/",
	settings: "/settings",
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
			return (
				<CryptoKeyGuard>
					<JournalPage />
				</CryptoKeyGuard>
			);
		case "settings":
			return <SettingsPage />;
		default:
			return null;
	}
}
