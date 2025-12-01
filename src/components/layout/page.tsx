import { cx } from "cva";
import type { ComponentProps } from "react";

type PageProps = ComponentProps<"div">;

export const Page = (props: PageProps) => {
	return (
		<div
			{...props}
			className={cx(
				"pl-app-left pr-app-right pb-app-bottom pt-app-top",
				props.className,
			)}
		/>
	);
};
