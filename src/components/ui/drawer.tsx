import { cx } from "cva";
import { AnimatePresence, motion } from "motion/react";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext } from "react";
import { createPortal } from "react-dom";

type DrawerContextValue = {
	onClose: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

type RootProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	children: ReactNode;
};

const Root = (props: RootProps) => {
	const handleClose = () => props.onOpenChange(false);

	return (
		<DrawerContext.Provider value={{ onClose: handleClose }}>
			<AnimatePresence>{props.open && props.children}</AnimatePresence>
		</DrawerContext.Provider>
	);
};

const Backdrop = () => (
	<motion.div
		className="fixed inset-0 bg-black/70"
		initial={{ opacity: 0 }}
		animate={{ opacity: 1 }}
		exit={{ opacity: 0 }}
	/>
);

type ContentProps = ComponentProps<"div">;

const Content = (props: ContentProps) => {
	const context = useContext(DrawerContext);
	if (!context) {
		throw new Error("Drawer.Content must be used within Drawer.Root");
	}

	const handleDragEnd = (
		_: unknown,
		{
			velocity,
			offset,
		}: {
			velocity: { x: number; y: number };
			offset: { x: number; y: number };
		},
	) => {
		const shouldDismissX =
			Math.abs(velocity.x) >= 750 || Math.abs(offset.x) >= 150;
		const shouldDismissY = velocity.y >= 750 || offset.y >= 250;

		if (shouldDismissX || shouldDismissY) {
			context.onClose();
		}
	};

	return createPortal(
		<>
			<Backdrop />
			<div className="fixed bottom-app-bottom left-app-left top-app-top right-app-right flex items-end justify-center">
				<motion.div
					className={cx(
						"flex flex-col w-full h-full rounded-2xl bg-white/5 backdrop-blur-3xl p-5 border",
						props.className,
					)}
					initial={{ y: "100%" }}
					animate={{ y: 0 }}
					exit={{ y: "100%" }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
					drag
					dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
					dragElastic={{ top: 0.1, bottom: 0.2, left: 0.2, right: 0.2 }}
					onDragEnd={handleDragEnd}
				>
					{props.children}
				</motion.div>
			</div>
		</>,
		document.body,
	);
};

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
	Content,
	Body,
	Toolbar,
};
