import { CryptoKeyGuard } from "@app/components/crypto-key-guard";
import { JournalPage } from "@app/components/pages/journal.page";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: IndexComponent,
});

function IndexComponent() {
	return (
		<CryptoKeyGuard>
			<JournalPage />
		</CryptoKeyGuard>
	);
}