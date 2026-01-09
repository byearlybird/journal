import { SettingsPage } from "@app/components/pages/settings.page";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";

export const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/settings",
	component: SettingsComponent,
});

function SettingsComponent() {
	return <SettingsPage />;
}
