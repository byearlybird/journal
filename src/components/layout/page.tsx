import { cx } from "cva";
import type { ComponentProps } from "react";

type PageProps = ComponentProps<"div">;

export const Page = (props: PageProps) => {
	return (
		<div
			{...props}
			className={cx(
				"pl-[var(--safe-left)] pr-[var(--safe-right)] pt-[var(--safe-top)] pb-[var(--safe-bottom)]",
				props.className,
			)}
		/>
	);
};
