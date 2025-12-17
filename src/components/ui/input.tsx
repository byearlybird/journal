import { cx } from "cva";
import type { ComponentProps } from "react";

export const Input = (props: ComponentProps<"input">) => (
	<input
		{...props}
		className={cx(
			"outline-none bg-white/4 rounded-xl px-3 py-2.5",
			props.className,
		)}
	/>
);
