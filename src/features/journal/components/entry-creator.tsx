import { PaperPlaneIcon, XIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button, Drawer, Textarea } from "@/components/ui";
import { useKeyboardHeight } from "@/lib/hooks";
import { EntryTypeToggle } from "./entry-type-toggle";

type EntryType = "note" | "task";

type EntryCreatorProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (content: string, type: EntryType) => void;
};

export const EntryCreator = (props: EntryCreatorProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [content, setContent] = useState("");
	const [type, setType] = useState<EntryType>("note");
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	useKeyboardHeight(setKeyboardHeight, []);

	useEffect(() => {
		if (props.open) {
			// Delay to allow drawer animation to complete
			const timer = setTimeout(() => {
				textareaRef.current?.focus();
			}, 300);
			return () => clearTimeout(timer);
		}
		// Reset state when drawer closes
		setContent("");
		setType("note");
	}, [props.open]);

	const handleSubmit = () => {
		props.onSubmit(content, type);
	};

	return (
		<Drawer.Root open={props.open} onOpenChange={props.onOpenChange}>
			<Drawer.Content>
				<Textarea
					ref={textareaRef}
					className="bg-white/4 rounded-xl p-2 flex-1"
					placeholder="What's on your mind?"
					value={content}
					onChange={(e) => setContent(e.currentTarget.value)}
				/>
				<motion.div
					className="flex gap-2 mt-4"
					animate={{ y: -keyboardHeight }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
				>
					<Button
						variant="outline-lightgray"
						size="md-icon"
						onClick={() => props.onOpenChange(false)}
					>
						{/* Cancel */}
						<XIcon />
					</Button>
					<EntryTypeToggle value={type} onValueChange={setType} />
					<Button
						variant="solid-yellow"
						disabled={content.length === 0}
						onClick={handleSubmit}
					>
						Save
						<PaperPlaneIcon />
					</Button>
				</motion.div>
			</Drawer.Content>
		</Drawer.Root>
	);
};
