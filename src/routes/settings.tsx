import { createFileRoute } from "@tanstack/solid-router";
import SettingsPage from "@/pages/settings";

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});
