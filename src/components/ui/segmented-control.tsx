import * as Headless from "@headlessui/react";
import { cx } from "cva";
import type { ReactNode } from "react";

type RootProps = {
	value: string;
	onValueChange: (value: string) => void;
	className?: string;
	children: ReactNode;
};

const Root = ({ value, onValueChange, className, children }: RootProps) => {
	return (
		<Headless.RadioGroup value={value} onChange={onValueChange}>
			<div
				className={cx(
					"flex-1 rounded-full border flex items-center min-h-10.5 backdrop-blur transition-all",
					className,
				)}
			>
				{children}
			</div>
		</Headless.RadioGroup>
	);
};

type ItemProps = {
	value: string;
	label: string;
	icon?: ReactNode;
	className?: string;
};

const Item = ({ value, label, icon, className }: ItemProps) => {
	return (
		<Headless.RadioGroup.Option value={value}>
			{({ checked }) => (
				<div
					className={cx(
						"flex items-center justify-center gap-2 px-3.5 py-2 [&>svg]:size-4 rounded-full transition-all transition-discrete active:scale-110 cursor-pointer",
						checked &&
							"w-4/5 border border-yellow-300/90 text-yellow-300/90 bg-yellow-300/10",
						!checked && "w-1/5",
						className,
					)}
				>
					<span
						data-part="label"
						className={cx("transition-discrete", !checked && "hidden")}
					>
						{label}
					</span>
					{icon}
				</div>
			)}
		</Headless.RadioGroup.Option>
	);
};

export const SegmentedControl = {
	Root,
	Item,
};
