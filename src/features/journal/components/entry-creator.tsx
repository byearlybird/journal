import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button, Drawer, Textarea } from "@/components/ui";
import { useKeyboardHeight } from "@/lib/hooks";

type EntryCreatorProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (content: string) => void;
};

export const EntryCreator = (props: EntryCreatorProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [content, setContent] = useState("");
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
		// Clear content when drawer closes
		setContent("");
	}, [props.open]);

	const handleSubmit = () => {
		props.onSubmit(content);
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
						className="flex-1"
						onClick={() => props.onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button variant="solid-yellow" className="flex-1" onClick={handleSubmit}>
						Save
					</Button>
				</motion.div>
			</Drawer.Content>
		</Drawer.Root>
	);
};
