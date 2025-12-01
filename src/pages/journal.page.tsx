import { Carousel } from "@ark-ui/react";
import { Page } from "@/components/layout";
import { PastEntries, TodayEntries, TodayHeader } from "@/features/journal";
import type { Entry } from "@/lib/db";
import { useDialogStore } from "@/lib/stores/dialog";

type PastEntriesPageProps = {
	onEntryClick: (entry: Entry) => void;
};

const PastEntriesPage = (props: PastEntriesPageProps) => {
	return (
		<Page className="mb-14 mt-4">
			<PastEntries onEntryClick={props.onEntryClick} />
		</Page>
	);
};

type TodayPageProps = {
	onEntryClick: (entry: Entry) => void;
};

const TodayPage = (props: TodayPageProps) => {
	return (
		<Page className="gap-2 flex flex-col mb-14">
			<TodayHeader />
			<TodayEntries onEntryClick={props.onEntryClick} />
		</Page>
	);
};

export const JournalPage = () => {
	const dialog = useDialogStore();

	const handleEntryClick = (entry: Entry) => {
		dialog.setViewEntry(entry);
	};

	return (
		<Carousel.Root
			className="fixed inset-0"
			slideCount={2}
			defaultPage={1}
			orientation="horizontal"
			spacing="0px"
			loop={false}
		>
			<Carousel.ItemGroup className="flex h-full">
				<Carousel.Item index={0}>
					<PastEntriesPage onEntryClick={handleEntryClick} />
				</Carousel.Item>
				<Carousel.Item index={1}>
					<TodayPage onEntryClick={handleEntryClick} />
				</Carousel.Item>
			</Carousel.ItemGroup>
		</Carousel.Root>
	);
};

export default JournalPage;
