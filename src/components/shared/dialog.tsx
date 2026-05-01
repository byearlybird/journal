import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { clsx } from "clsx";
import type { ReactNode } from "react";

type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  size?: "default" | "small";
  children: ReactNode;
};

export function Dialog({ open, onOpenChange, title, size = "default", children }: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 bg-backdrop data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-200" />
        <BaseDialog.Viewport className="fixed top-[calc(0.25rem+var(--spacing-safe-top))] left-[calc(0.25rem+var(--spacing-safe-left))] right-[calc(0.25rem+var(--spacing-safe-right))] md:top-safe-top md:bottom-safe-bottom md:left-safe-left md:right-safe-right md:flex md:items-start md:justify-center md:pt-[16vh] md:p-4">
          <BaseDialog.Popup
            className={clsx(
              "w-full rounded-2xl bg-surface outline outline-border data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 transition-all duration-200 ease-out",
              size === "default" && "md:max-w-xl p-6",
              size === "small" && "md:max-w-sm p-4",
            )}
          >
            {title && (
              <BaseDialog.Title className="text-sm font-medium text-foreground-muted mb-4">
                {title}
              </BaseDialog.Title>
            )}
            {children}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export const DialogClose = BaseDialog.Close;
