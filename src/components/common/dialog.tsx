import { Dialog } from "@base-ui/react/dialog";
import { cx } from "cva";
import type { ComponentProps, ReactNode } from "react";

export const DialogRoot = Dialog.Root;

export function DialogTrigger({ className, ...props }: ComponentProps<typeof Dialog.Trigger>) {
  return <Dialog.Trigger className={cx("cursor-default", className)} {...props} />;
}

export function DialogContent({ children }: { children: ReactNode }) {
  return (
    <Dialog.Portal>
      <Dialog.Backdrop className="fixed inset-0 bg-slate-dark/80 transition-opacity data-starting-style:opacity-0 data-ending-style:opacity-0" />
      <Dialog.Popup className="fixed z-50 inset-x-0 -top-10 flex flex-col h-1/2 max-w-2xl mx-auto overflow-y-auto p-2 pt-[calc(var(--safe-top)+var(--spacing)*10)] bg-slate-medium border border-slate-light rounded-lg transition-[translate,opacity] data-starting-style:-translate-y-full data-starting-style:opacity-0 data-ending-style:-translate-y-full data-ending-style:opacity-0">
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  );
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof Dialog.Title>) {
  return <Dialog.Title className={cx("sr-only", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cx("flex justify-between gap-4 p-2", className)} {...props} />;
}
