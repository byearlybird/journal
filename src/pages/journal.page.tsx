import * as carousel from "@zag-js/carousel";
import { normalizeProps, useMachine } from "@zag-js/solid";
import { createMemo, createUniqueId } from "solid-js";
import { Page } from "@/components/layout";
import { PastEntries, TodayEntries, TodayHeader } from "@/features/journal";
import type { Entry } from "@/lib/db";
import { useDialogStore } from "@/lib/stores/dialog";

type PastEntriesPageProps = {
	onEntryClick: (entry: Entry) => void;
};

const PastEntriesPage = (props: PastEntriesPageProps) => {
	return (
		<Page class="mb-14 mt-4">
			<PastEntries onEntryClick={props.onEntryClick} />
		</Page>
	);
};

type TodayPageProps = {
	onEntryClick: (entry: Entry) => void;
};

const TodayPage = (props: TodayPageProps) => {
	return (
		<Page class="gap-2 flex flex-col mb-14">
			<TodayHeader />
			<TodayEntries onEntryClick={props.onEntryClick} />
		</Page>
	);
};

export const JournalPage = () => {
	const dialog = useDialogStore();

	const service = useMachine(carousel.machine, {
		id: createUniqueId(),
		slideCount: 2,
		defaultPage: 1,
		orientation: "horizontal",
		spacing: "0px",
		loop: false,
	});

	const api = createMemo(() => carousel.connect(service, normalizeProps));

	const handleEntryClick = (entry: Entry) => {
		dialog.setViewEntry(entry);
	};

	return (
		<div {...api().getRootProps()} class="fixed inset-0">
			<div {...api().getItemGroupProps()} class="flex h-full">
				<div {...api().getItemProps({ index: 0 })}>
					<PastEntriesPage onEntryClick={handleEntryClick} />
				</div>
				<div {...api().getItemProps({ index: 1 })}>
					<TodayPage onEntryClick={handleEntryClick} />
				</div>
			</div>
		</div>
	);
};

export default JournalPage;
