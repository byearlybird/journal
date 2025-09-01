import { cx } from "cva";
import type React from "react";

export type SubheaderProps = React.ComponentPropsWithoutRef<"h3">;

export const Subheader = ({
	className = "",
	children,
	...rest
}: SubheaderProps) => (
	<h3 className={cx("p-2 font-semibold font-serif", className)} {...rest}>
		{children}
	</h3>
);

Subheader.displayName = "Subheader";
