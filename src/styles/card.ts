import { cva } from "cva";

export const card = cva({
  base: "border",
  variants: {
    layer: {
      base: "rounded-md",
      elevated: "rounded-lg",
    },
    density: {
      compact: "p-2",
      default: "p-4",
    },
  },
  defaultVariants: {
    layer: "base",
    density: "default",
  },
});
