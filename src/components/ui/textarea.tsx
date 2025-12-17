import { cx } from "cva";
import type { ComponentProps } from "react";

export const Textarea = (props: ComponentProps<"textarea">) => (
	<textarea
		{...props}
		className={cx(
			"resize-none outline-none transition-colors",
			"focus:outline-none data-focus:ring-2 data-focus:ring-yellow-300/50",
			"data-disabled:opacity-50 data-disabled:cursor-not-allowed",
			props.className,
		)}
	/>
);
