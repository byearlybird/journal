import * as Headless from "@headlessui/react";
import { cva, type VariantProps } from "cva";

const styles = {
	base: [
		// Base
		"relative isolate inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium shrink-0",
		// Focus
		"focus:outline-hidden data-focus:outline-2 data-focus:outline-offset-2 data-focus:outline-yellow-300/90",
		// Disabled
		"data-disabled:opacity-50",
		// Active/Hover
		"active:scale-105 data-disabled:active:scale-100 transition-all",
		// Icons
		"[&>svg]:size-4",
	],
	variants: {
		outline: [
			"border backdrop-blur bg-white/8 shadow",
			"data-hover:bg-white/10 data-active:bg-white/12",
		],
		solid: [
			"bg-yellow-300/90 text-black shadow",
			"data-hover:bg-yellow-300 data-active:bg-yellow-400/90",
		],
		ghost: [
			"border border-yellow-300/90 text-yellow-300/90 bg-yellow-300/10",
			"data-hover:bg-yellow-300/20 data-active:bg-yellow-300/30 transition-colors",
		],
	},
};

const button = cva({
	base: styles.base,
	variants: {
		variant: {
			outline: styles.variants.outline,
			solid: styles.variants.solid,
			ghost: styles.variants.ghost,
		},
		size: {
			md: "px-3.5 py-2",
			icon: "size-9",
		},
	},
	defaultVariants: {
		variant: "outline",
		size: "md",
	},
});

type ButtonProps = Headless.ButtonProps & VariantProps<typeof button>;

export const Button = ({ variant, size, className, ...props }: ButtonProps) => (
	<Headless.Button
		{...props}
		className={button({ variant, size, className })}
	/>
);
