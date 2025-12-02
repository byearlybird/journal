import { CheckCircleIcon, NoteIcon } from "@phosphor-icons/react";

type EntryType = "note" | "task";

type EntryTypeToggleProps = {
	value: EntryType;
	onValueChange: (value: EntryType) => void;
};

const itemClass =
	"flex items-center justify-center gap-2 px-3.5 py-2 [&>svg]:size-4 rounded-full transition-all transition-discrete active:scale-110 data-[status=active]:w-4/5 data-[status=active]:border data-[status=active]:border-yellow-300/90 data-[status=active]:text-yellow-300/90 data-[status=active]:bg-yellow-300/10 data-[status=inactive]:w-1/5 [&:not([data-status=active])>[data-part=label]]:hidden";

export const EntryTypeToggle = (props: EntryTypeToggleProps) => {
	return (
		<div className="flex-1 rounded-full border flex items-center min-h-10.5 backdrop-blur transition-all">
			<button
				type="button"
				data-status={props.value === "note" ? "active" : "inactive"}
				className={itemClass}
				onClick={() => props.onValueChange("note")}
			>
				<span data-part="label">Note</span>
				<NoteIcon />
			</button>
			<button
				type="button"
				data-status={props.value === "task" ? "active" : "inactive"}
				className={itemClass}
				onClick={() => props.onValueChange("task")}
			>
				<span data-part="label">Task</span>
				<CheckCircleIcon />
			</button>
		</div>
	);
};
