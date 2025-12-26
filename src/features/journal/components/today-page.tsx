import { TodayEntries } from "./today-entries";
import { TodayHeader } from "./today-header";
import type { Entry } from "@/lib/db";

type TodayPageProps = {
	onEntryClick: (entry: Entry) => void;
};

export const TodayPage = (props: TodayPageProps) => {
	return (
		<div className="gap-2 pl-app-left pr-app-right flex flex-col mb-14">
			<TodayHeader />
			<TodayEntries onEntryClick={props.onEntryClick} />
		</div>
	);
};

