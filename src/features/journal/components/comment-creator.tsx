import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button, Drawer, Textarea } from "@/components/ui";
import { useKeyboardHeight } from "@/lib/hooks";

type CommentCreatorProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (content: string) => void;
	entryContent: string;
};

export const CommentCreator = (props: CommentCreatorProps) => {
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [content, setContent] = useState("");
	const [keyboardHeight, setKeyboardHeight] = useState(0);
	useKeyboardHeight(setKeyboardHeight, []);

	useEffect(() => {
		if (props.open) {
			// Delay to allow drawer animation to complete
			const timer = setTimeout(() => {
				textareaRef.current?.focus();
			}, 305);
			return () => clearTimeout(timer);
		}
		// Reset state when drawer closes
		setContent("");
	}, [props.open]);

	const handleSubmit = () => {
		props.onSubmit(content);
	};

	return (
		<Drawer.Root open={props.open} onOpenChange={props.onOpenChange}>
			<Drawer.Content>
				<p className="line-clamp-4 text-xs text-white/60 mb-3">
					{props.entryContent}
				</p>
				<Textarea
					ref={textareaRef}
					className="bg-white/4 rounded-lg p-2 flex-1"
					placeholder="Add a comment..."
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
						<XIcon />
					</Button>
					<Button
						variant="solid-yellow"
						className="flex-1"
						disabled={content.length === 0}
						onClick={handleSubmit}
					>
						Save
						<CheckIcon />
					</Button>
				</motion.div>
			</Drawer.Content>
		</Drawer.Root>
	);
};
