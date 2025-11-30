import type { RouteDefinition } from "@solidjs/router";
import { lazy } from "solid-js";

const JournalLayout = lazy(() => import("@/pages/journal.layout"));
const JournalPage = lazy(() => import("@/pages/journal.page"));
const SettingsPage = lazy(() => import("@/pages/settings"));

export const routes: RouteDefinition[] = [
	{
		path: "/",
		component: JournalLayout,
		children: [
			{
				path: "/",
				component: JournalPage,
			},
		],
	},
	{
		path: "/settings",
		component: SettingsPage,
	},
];

// Extract all valid route paths as a union type
export type AppRoute = (typeof routes)[number]["path"];
