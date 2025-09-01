import { cva, type VariantProps } from "cva";
import type { ComponentProps } from "react";

const button = cva({
	base: "flex justify-center items-center gap-2 text-center active:scale-110 active:opacity-95 active:brightness-110 rounded-sm font-medium text-sm transition-all *:data-[slot=icon]:size-5 disabled:brightness-50",
	variants: {
		variant: {
			primary: "bg-primary text-primary-foreground",
			secondary: "bg-secondary text-secondary-foreground",
			outline: "bg-transparent border backdrop-blur-sm",
			ghost: "bg-transparent text-muted-foreground",
		},
		size: {
			md: "p-2.5",
			lg: "p-3.5",
		},
		elevated: {
			true: "shadow",
			false: "",
		},
	},
	defaultVariants: {
		variant: "primary",
		size: "md",
		elevated: false,
	},
});

export type ButtonProps = ComponentProps<"button"> &
	VariantProps<typeof button>;

export const Button = ({
	variant,
	size,
	className,
	elevated,
	...props
}: ButtonProps) => (
	<button className={button({ variant, size, className, elevated })} {...props}>
		{props.children}
	</button>
);
