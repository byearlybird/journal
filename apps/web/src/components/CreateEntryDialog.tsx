import {
	Dialog,
	DialogBackdrop,
	DialogPanel,
	DialogTitle,
} from "@headlessui/react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import { entry } from "../collections/entries";
import { Button } from "./Button";
import { useMutate } from "./StoreContext";
import { Textarea } from "./Textarea";

export const CreateEntryDialog = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const [inputValue, setInputValue] = useState("");
	const { insert } = useMutate();

	const handleSave = () => {
		insert(
			entry({
				content: inputValue,
				date: new Date().toISOString().split("T")[0],
			}),
		);
		setInputValue("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onClose={() => onOpenChange(false)}>
			<DialogBackdrop
				transition
				className="fixed inset-0 bg-black opacity-30 transition-opacity duration-200 data-[closed]:opacity-0 data-[enter]:ease-out data-[leave]:ease-in sm:flex sm:justify-center dark:opacity-70"
			/>
			<DialogPanel
				as="form"
				transition
				className="data-[closed]:-translate-y-full fixed inset-x-0 top-0 flex max-h-2/3 min-h-1/3 translate-y-0 flex-col gap-3 overflow-y-scroll rounded-b-xl border-b bg-background/90 p-3 text-foreground shadow-xl backdrop-blur-xs transition-transform duration-300 ease-out data-[enter]:ease-out data-[leave]:ease-in"
				onSubmit={(e) => {
					e.preventDefault();
					handleSave();
				}}
			>
				<DialogTitle className="sr-only">Create a new entry</DialogTitle>
				<Textarea
					autoFocus
					required
					minLength={1}
					placeholder="What's on your mind?"
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
				/>
				<div className="flex shrink-0 justify-between gap-4">
					<Button
						type="button"
						elevated
						variant="outline"
						onClick={() => {
							setInputValue("");
							onOpenChange(false);
						}}
					>
						<XMarkIcon />
					</Button>
					<Button type="submit" elevated disabled={!inputValue}>
						<CheckIcon />
					</Button>
				</div>
			</DialogPanel>
		</Dialog>
	);
};
