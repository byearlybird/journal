import { CheckCircleIcon, NoteIcon } from "@phosphor-icons/react";
import { SegmentedControl } from "@/components/ui/segmented-control";

type EntryType = "note" | "task";

type EntryTypeToggleProps = {
	value: EntryType;
	onValueChange: (value: EntryType) => void;
};

export const EntryTypeToggle = (props: EntryTypeToggleProps) => {
	return (
		<SegmentedControl.Root
			value={props.value}
			onValueChange={props.onValueChange}
		>
			<SegmentedControl.Item
				value="note"
				label="Note"
				icon={<NoteIcon className="min-w-4 size-4" />}
			/>
			<SegmentedControl.Item
				value="task"
				label="Task"
				icon={<CheckCircleIcon className="min-w-4 size-4" />}
			/>
		</SegmentedControl.Root>
	);
};
