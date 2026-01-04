import { CryptoKeyGuard } from "@app/components/crypto-key-guard/crypto-key-guard";
import { HomePage } from "@app/components/home-page/home-page";
import { Navbar } from "@app/components/navbar/navbar";
import { NotFound } from "@app/components/not-found-page/not-found-page";
import { SettingsPage } from "@app/components/settings-page/settings-page";
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
			{children}
			<Navbar />
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
					<HomePage />
				</CryptoKeyGuard>
			);
		case "settings":
			return <SettingsPage />;
		default:
			return null;
	}
}
