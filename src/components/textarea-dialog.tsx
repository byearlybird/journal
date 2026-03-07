import {
  DialogBackdrop,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "@app/components/dialog";
import { Button } from "@app/components/button";
import { useState } from "react";

export function TextareaDialog({
  open,
  onClose,
  onSave,
  title,
  placeholder,
  initialContent,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  title: string;
  placeholder?: string;
  initialContent: string;
}) {
  const [content, setContent] = useState(initialContent);

  const handleClose = () => {
    setContent(initialContent);
    onClose();
  };

  const handleSave = () => {
    if (content.trim() === "") return;
    onSave(content.trim());
    handleClose();
  };

  return (
    <DialogRoot open={open} onOpenChange={handleClose}>
      <DialogPortal keepMounted>
        <DialogBackdrop />
        <DialogPopup className="top-[calc(var(--safe-top,0px)+0.5rem)] h-1/2 data-starting-style:-translate-y-full data-ending-style:-translate-y-full">
                <DialogTitle>{title}</DialogTitle>
                <textarea
                  placeholder={placeholder}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="scrollbar-hide text-base h-full border-t border-dotted w-full resize-none p-2 placeholder:text-cloud-medium outline-none"
                />
                <div className="flex justify-between gap-4 p-2">
                  <Button onClick={handleClose} variant="slate">
                    Cancel
                  </Button>
                  <Button disabled={content.trim() === ""} onClick={handleSave} variant="gold">
                    Save
                  </Button>
                </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
