import { useState } from "react";
import { useStore } from "@nanostores/react";
import { Dialog } from "@base-ui/react/dialog";
import { Button } from "./button";
import { $createLabelOpen, closeCreateLabel } from "@/stores/create-label";
import { labelsService } from "@/services/label-service";

export function CreateLabelDialog() {
  const open = useStore($createLabelOpen);
  const [name, setName] = useState("");

  async function handleSubmit() {
    if (!name.trim()) return;
    await labelsService.createLabel(name.trim());
    setName("");
    closeCreateLabel();
  }

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) {
      setName("");
      closeCreateLabel();
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/70 data-starting-style:opacity-0 data-ending-style:opacity-0 transition-opacity duration-200" />
        <Dialog.Viewport className="fixed inset-x-1 top-1 sm:inset-0 sm:flex sm:items-start sm:justify-center sm:pt-[20vh] sm:p-4">
          <Dialog.Popup className="w-full sm:max-w-sm rounded-2xl bg-surface outline outline-border p-6 data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 transition-all duration-200 ease-out">
            <Dialog.Title className="text-sm font-medium text-foreground-muted mb-4">
              New label
            </Dialog.Title>
            <input
              className="w-full bg-transparent text-foreground placeholder:text-foreground-muted outline-none text-sm leading-relaxed mb-6 font-serif"
              placeholder="Label name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <Dialog.Close render={(props) => <Button variant="secondary" {...props} />}>
                Cancel
              </Dialog.Close>
              <Button onClick={handleSubmit} disabled={!name.trim()}>
                Add
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
