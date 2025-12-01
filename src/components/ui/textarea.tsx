import { cva, type VariantProps } from "cva";
import type { ComponentProps } from "react";

const textarea = cva({
	base: "resize-none outline-none",
});

type TextareaProps = ComponentProps<"textarea"> & VariantProps<typeof textarea>;

export const Textarea = (props: TextareaProps) => (
	<textarea {...props} className={textarea({ class: props.className })} />
);
