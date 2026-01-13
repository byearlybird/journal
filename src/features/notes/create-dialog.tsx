import { Dialog, DialogPanel, DialogTitle, Textarea } from "@headlessui/react";
import { useStore } from "@nanostores/react";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { atom } from "nanostores";
import { useRef, useState } from "react";
import { useCreateNote } from "./use-notes";

export const $isCreateDialogOpen = atom(false);

export function openCreateDialog() {
	$isCreateDialogOpen.set(true);
}

export function closeCreateDialog() {
	$isCreateDialogOpen.set(false);
}

export function CreateDialog() {
	let hasFocused = false;
	const { mutate: createNote } = useCreateNote();
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const isOpen = useStore($isCreateDialogOpen);
	const [content, setContent] = useState<string>("");

	const handleSave = () => {
		if (content.trim() === "") return;
		createNote({ content: content.trim() });
		setContent("");
		closeCreateDialog();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<Dialog
					static
					open={isOpen}
					onClose={closeCreateDialog}
					className="relative z-50"
				>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50"
					/>
					<div className="fixed inset-x-0 top-0 flex h-svh w-screen justify-center p-2">
						<DialogPanel
							as={motion.div}
							initial={{ opacity: 0, y: -100 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -100 }}
							onAnimationComplete={() => {
								if (!hasFocused) {
									inputRef.current?.focus();
									hasFocused = true;
								}
							}}
							className="flex h-1/2 w-full max-w-2xl flex-col space-y-4 overflow-y-auto rounded-lg border bg-graphite"
						>
							<DialogTitle className="sr-only">Create a new entry</DialogTitle>
							<Textarea
								ref={inputRef}
								placeholder="What's on your mind?"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								className="scrollbar-hide h-full w-full resize-none p-4 placeholder:text-white/50 focus:outline-none"
							/>
							<div className="right-0 left-0 flex justify-between gap-4 p-4">
								<button
									type="button"
									onClick={closeCreateDialog}
									className="flex size-11 items-center justify-center rounded-full border"
								>
									<XIcon className="h-4 w-4" />
								</button>
								<button
									disabled={content.trim() === ""}
									type="button"
									className="flex size-11 items-center justify-center rounded-full bg-yellow text-black disabled:opacity-50"
									onClick={handleSave}
								>
									<CheckIcon className="h-4 w-4" />
								</button>
							</div>
						</DialogPanel>
					</div>
				</Dialog>
			)}
		</AnimatePresence>
	);
}
