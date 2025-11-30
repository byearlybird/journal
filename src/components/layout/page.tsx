import { cx } from "cva";
import type { ComponentProps, ValidComponent } from "solid-js";

type PageProps<T extends ValidComponent = "div"> = ComponentProps<T>;

export const Page = <T extends ValidComponent = "div">(props: PageProps<T>) => {
	return (
		<div
			{...props}
			class={cx(
				"pl-[var(--safe-left)] pr-[var(--safe-right)] pt-[var(--safe-top)] pb-[var(--safe-bottom)]",
				props.class,
			)}
		/>
	);
};
