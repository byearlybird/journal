import { cva, type VariantProps } from "cva";
import type { ComponentProps, ElementType } from "react";

const card = cva({
	base: "bg-white/8 transition-colors",
	variants: {
		size: {
			sm: "rounded-lg p-1",
			md: "rounded-xl p-4",
		},
	},
	defaultVariants: {
		size: "md",
	},
});

type CardProps<T extends ElementType = "div"> = {
	as?: T;
} & ComponentProps<T> &
	VariantProps<typeof card>;

export const Card = <T extends ElementType = "div">({
	as,
	size,
	className,
	...props
}: CardProps<T>) => {
	const Component = as || "div";
	return <Component {...props} className={card({ size, className })} />;
};
