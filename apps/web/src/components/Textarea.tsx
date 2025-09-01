import { cx } from "cva";
import type { ComponentProps } from "react";

export const Textarea = ({
	className,
	...props
}: ComponentProps<"textarea">) => (
	<textarea
		className={cx(
			"min-h-10 w-full flex-1 resize-none overflow-y-auto rounded-md border p-3 outline-none data-focus:ring data-focus:ring-accent",
			className,
		)}
		{...props}
	/>
);
