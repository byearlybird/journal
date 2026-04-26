import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "@/components/button";

export function InputDialog({
  open,
  onOpenChange,
  title,
  initialValue = "",
  placeholder,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  initialValue?: string;
  placeholder?: string;
  onSave: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const saveDisabled = !value.trim() || value.trim() === initialValue.trim();

  function handleSave() {
    if (saveDisabled) return;
    onSave(value.trim());
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/70 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-200" />
        <Dialog.Viewport className="fixed inset-x-1 top-1 sm:inset-0 sm:flex sm:items-start sm:justify-center sm:pt-[20vh] sm:p-4">
          <Dialog.Popup className="w-full sm:max-w-sm rounded-2xl bg-surface outline outline-border p-4 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 transition-all duration-200 ease-out">
            {title && (
              <Dialog.Title className="text-sm font-medium text-foreground-muted mb-4">
                {title}
              </Dialog.Title>
            )}
            <input
              type="text"
              className="w-full bg-transparent text-foreground placeholder:text-foreground-muted outline-none text-base leading-relaxed mb-4 font-serif"
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <Dialog.Close render={(props) => <Button variant="secondary" {...props} />}>
                Cancel
              </Dialog.Close>
              <Button onClick={handleSave} disabled={saveDisabled}>
                Save
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
