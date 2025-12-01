import { createFileRoute } from "@tanstack/solid-router";
import JournalLayout from "@/pages/journal.layout";
import JournalPage from "@/pages/journal.page";

export const Route = createFileRoute("/")({
	component: () => (
		<JournalLayout>
			<JournalPage />
		</JournalLayout>
	),
});
