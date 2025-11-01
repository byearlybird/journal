import { Dialog } from "@ark-ui/react/dialog";
import { Portal } from "@ark-ui/react/portal";
import { PaperPlaneIcon, XIcon } from "@phosphor-icons/react";
import { type ComponentProps, useState } from "react";
import { Button, Textarea } from "@/components/ui";

export const TextareaDialog = (
	props: ComponentProps<typeof Dialog.Root> & {
		onSubmit: (content: string) => void;
		onCancel: () => void;
	},
) => {
	const [content, setContent] = useState("");

	const handleSubmit = () => props.onSubmit(content);

	return (
		<Dialog.Root
			{...props}
			onExitComplete={() => {
				setContent("");
				props.onExitComplete?.();
			}}
		>
			<Portal>
				<Dialog.Backdrop className="fixed inset-0 bg-black/70 transition-all" />
				<Dialog.Positioner className="z-50 fixed inset-0 flex items-end justify-center p-2 pb-[calc(var(--spacing-app-bottom-kb)+8px)]">
					<Dialog.Content className="w-full max-w-2xl flex items-center gap-2 z-50">
						<Textarea
							autoFocus
							className="w-full bg-white/8 backdrop-blur-3xl p-2 rounded-xl shadow border"
							rows={4}
							value={content}
							onChange={(e) => setContent(e.currentTarget.value)}
						/>
						<div className="flex flex-col gap-2">
							<Button
								variant="outline-lightgray"
								className="min-w-11 min-h-11 mt-auto shadow"
								onClick={props.onCancel}
							>
								<XIcon />
							</Button>
							<Button
								variant="solid-yellow"
								className="min-w-11 min-h-11 mt-auto shadow"
								onClick={handleSubmit}
							>
								<PaperPlaneIcon />
							</Button>
						</div>
					</Dialog.Content>
				</Dialog.Positioner>
			</Portal>
		</Dialog.Root>
	);
};
