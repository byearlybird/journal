import { store } from "@app/store";
import { Dialog, DialogPanel, DialogTitle, Textarea } from "@headlessui/react";
import { useStore } from "@nanostores/react";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { atom } from "nanostores";
import { useRef, useState } from "react";

export const $isCreateDialogOpen = atom(false);

export function openCreateDialog() {
	$isCreateDialogOpen.set(true);
}

export function closeCreateDialog() {
	$isCreateDialogOpen.set(false);
}

export function CreateDialog() {
	let hasFocused = false;
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const isOpen = useStore($isCreateDialogOpen);
	const [content, setContent] = useState<string>("");

	const handleSave = () => {
		if (content.trim() === "") return;
		store.notes.add({ content: content.trim() });
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
					<div className="fixed inset-x-0 top-0 flex w-screen justify-center p-2 h-svh">
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
							className="space-y-4 border border-white/10 rounded-lg bg-graphite w-full h-1/2 flex flex-col overflow-y-auto"
						>
							<DialogTitle className="sr-only">Create a new entry</DialogTitle>
							<Textarea
								ref={inputRef}
								placeholder="What's on your mind?"
								value={content}
								onChange={(e) => setContent(e.target.value)}
								className="w-full focus:outline-none p-4 h-full resize-none scrollbar-hide placeholder:text-white/50"
							/>
							<div className="flex gap-4 p-4 left-0 justify-between right-0">
								<button
									type="button"
									onClick={closeCreateDialog}
									className="flex items-center justify-center size-11 rounded-full border border-white/10"
								>
									<XIcon className="w-4 h-4" />
								</button>
								<button
									disabled={content.trim() === ""}
									type="button"
									className="flex items-center disabled:opacity-50 justify-center size-11 bg-yellow rounded-full text-black"
									onClick={handleSave}
								>
									<CheckIcon className="w-4 h-4" />
								</button>
							</div>
						</DialogPanel>
					</div>
				</Dialog>
			)}
		</AnimatePresence>
	);
}
