import { cx } from "cva";
import type { ComponentProps } from "react";

export const Textarea = (props: ComponentProps<"textarea">) => (
	<textarea
		{...props}
		className={cx("resize-none outline-none", props.className)}
	/>
);
