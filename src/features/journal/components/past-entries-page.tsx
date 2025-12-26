import { PastEntries } from "./past-entries";
import type { Entry } from "@/lib/db";

type PastEntriesPageProps = {
	onEntryClick: (entry: Entry) => void;
};

export const PastEntriesPage = (props: PastEntriesPageProps) => {
	return (
		<div className="mb-14 mt-4 pl-app-left pr-app-right">
			<PastEntries onEntryClick={props.onEntryClick} />
		</div>
	);
};

