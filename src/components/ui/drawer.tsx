import { Dialog as ArkDialog } from "@ark-ui/react/dialog";
import { Portal as ArkPortal } from "@ark-ui/react/portal";
import { cx } from "cva";
import type { ComponentProps } from "react";

const Root = ArkDialog.Root;
const Trigger = ArkDialog.Trigger;
const Close = ArkDialog.CloseTrigger;
const Title = ArkDialog.Title;
const Description = ArkDialog.Description;

type ContentProps = ComponentProps<typeof ArkDialog.Content>;

const Content = (props: ContentProps) => (
	<ArkPortal>
		<ArkDialog.Backdrop
			className={cx("fixed inset-0 bg-black/70 backdrop-blur-xs")}
		/>
		<ArkDialog.Positioner className="fixed inset-0 flex items-end justify-center">
			<ArkDialog.Content
				{...props}
				className={cx(
					"flex flex-col w-full h-[calc(90vh-var(--spacing-app-top))] rounded-t-2xl bg-white/5 backdrop-blur-3xl p-6 border border-b-0",
					"data-[state=open]:animate-[slideUpFromBottom_150ms_ease-out] data-[state=open]:translate-y-0",
					"data-[state=closed]:animate-[slideDownToBottom_150ms_ease-in]",
					"translate-y-full",
					props.className,
				)}
			>
				{props.children}
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
			"flex-shrink-0 pb-4 -mx-2 -mt-2 mb-2 border-b border-dashed",
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
