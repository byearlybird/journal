import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { Portal as ArkPortal } from "@ark-ui/react/portal";
import { cx } from "cva";
import { motion } from "motion/react";
import type { ComponentProps } from "react";

const Root = ArkDialog.Root;
const Trigger = ArkDialog.Trigger;
const Close = ArkDialog.CloseTrigger;
const Title = ArkDialog.Title;
const Description = ArkDialog.Description;

type ContentProps = ComponentProps<typeof ArkDialog.Content>;

const Content = (
	props: ContentProps & {
		onDismiss: () => void;
	},
) => (
	<ArkPortal>
		<ArkDialog.Backdrop className={cx("fixed inset-0 bg-black/70")} />
		<ArkDialog.Positioner className="fixed bottom-app-bottom left-app-left top-app-top right-app-right flex items-end justify-center">
			<ArkDialog.Content
				asChild
				{...props}
				className={cx(
					"flex flex-col w-full h-full rounded-2xl bg-white/5 backdrop-blur-3xl p-5 border",
					"data-[state=open]:animate-[slideUpFromBottom_150ms_ease-out] data-[state=open]:translate-y-0",
					"data-[state=closed]:animate-[slideDownToBottom_150ms_ease-in]",
					"translate-y-full",
					props.className,
				)}
			>
				<motion.div
					drag
					dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
					dragElastic={{
						left: 0.05,
						right: 0.05,
						top: 0.1,
						bottom: 0.2,
					}}
					onDragEnd={(_, { velocity, offset }) => {
						if (velocity.y >= 1000 || offset.y >= 250) {
							// TODO: animate out
							props.onDismiss();
						}
					}}
				>
					{props.children}
				</motion.div>
			</ArkDialog.Content>
		</ArkDialog.Positioner>
	</ArkPortal>
);

const Body = (props: ComponentProps<"div">) => (
	<div
		{...props}
		className={cx("flex-1 overflow-y-auto min-h-0", props.className)}
	>
		{props.children}
	</div>
);

const Toolbar = (props: ComponentProps<"div">) => (
	<div
		{...props}
		className={cx(
			"flex-shrink-0 pb-2.5 -mx-2 -mt-2 mb-2 border-b border-dashed",
			props.className,
		)}
	>
		{props.children}
	</div>
);

export const Drawer = {
	Root,
	Trigger,
	Close,
	Title,
	Description,
	Content,
	Body,
	Toolbar,
};
