import { forwardRef } from "react";
import clsx from "clsx";

type PillProps = React.ComponentPropsWithoutRef<"button"> & {
  selected?: boolean;
};

export const Pill = forwardRef<HTMLButtonElement, PillProps>(
  ({ className, selected, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        data-selected={selected || undefined}
        className={clsx(
          "rounded-full px-3.5 py-2 text-white/70 transition-all active:scale-95",
          "data-selected:bg-black/90 data-selected:text-white/90",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Pill.displayName = "Pill";
