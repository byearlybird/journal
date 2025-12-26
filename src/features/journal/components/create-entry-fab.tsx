import { PenIcon } from "@phosphor-icons/react";

type CreateEntryFabProps = {
	onClick: () => void;
};

export const CreateEntryFab = (props: CreateEntryFabProps) => {
	return (
		<div className="flex items-center bottom-app-bottom fixed right-4">
			<button
				type="button"
				className="size-11 flex items-center bg-yellow-300/90 outline outline-white/20 shadow backdrop-blur-xl text-black rounded-full justify-center active:scale-110 transition-all"
				onClick={props.onClick}
			>
				<PenIcon className="size-5" />
			</button>
		</div>
	);
};

