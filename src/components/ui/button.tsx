import { cva, type VariantProps } from "cva";
import type { ComponentProps } from "react";

const button = cva({
	base: "rounded-full shrink-0 shadow text-sm active:scale-105 disabled:active:scale-100 transition-all disabled:opacity-50",
	variants: {
		variant: {
			"outline-lightgray": "border backdrop-blur bg-white/8",
			"solid-yellow": "bg-yellow-300/90 text-black",
			"outline-yellow":
				"border border-yellow-300/90 text-yellow-300/90 bg-yellow-300/10 transition-colors",
		},
		size: {
			md: "px-3.5 py-2 [&>svg]:size-4",
			"md-icon": "size-9 flex items-center justify-center [&>svg]:size-4",
		},
	},
	defaultVariants: {
		variant: "outline-lightgray",
		size: "md",
	},
});

type ButtonProps = ComponentProps<"button"> & VariantProps<typeof button>;

export const Button = (props: ButtonProps) => (
	<button type="button" {...props} className={button(props)} />
);
