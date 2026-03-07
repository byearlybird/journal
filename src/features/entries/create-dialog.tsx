import { cx } from "cva";
import { Button as BaseButton } from "@base-ui/react";
import { Button } from "@app/components/button";
import {
  DialogBackdrop,
  DialogRoot,
  DialogPortal,
  DialogPopup,
  DialogTitle,
} from "@app/components/dialog";
import { CircleIcon, SquareIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { useCreateNote } from "@app/features/notes";
import { useCreateTask } from "@app/features/tasks";

export function CreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createNote = useCreateNote();
  const createTask = useCreateTask();
  const [content, setContent] = useState<string>("");
  const [entryType, setEntryType] = useState<"note" | "task">("note");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleClose = () => {
    setContent("");
    setEntryType("note");
    onClose();
  };

  const handleSave = () => {
    if (content.trim() === "") return;

    if (entryType === "note") {
      void createNote({ content: content.trim() });
    } else if (entryType === "task") {
      void createTask({ content: content.trim() });
    }

    setContent("");
    handleClose();
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={handleClose}
      onOpenChangeComplete={(open) => {
        if (open) {
          textareaRef.current?.focus();
        }
      }}
    >
      <DialogPortal keepMounted>
        <DialogBackdrop />
        <DialogPopup className="top-[calc(var(--safe-top,0px)+0.5rem)] h-1/2 data-starting-style:-translate-y-full data-ending-style:-translate-y-full">
          <DialogTitle>Create a new entry</DialogTitle>
          <Toolbar entryType={entryType} onEntryTypeChange={setEntryType} />
          <textarea
            ref={textareaRef}
            placeholder="What's on your mind?"
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

function Toolbar({
  entryType,
  onEntryTypeChange,
}: {
  entryType: "note" | "task";
  onEntryTypeChange: (type: "note" | "task") => void;
}) {
  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex w-fit rounded-full shrink-0 gap-2">
        <ToolbarButton selected={entryType === "note"} onClick={() => onEntryTypeChange("note")}>
          <CircleIcon className="size-4" />
          Note
        </ToolbarButton>
        <ToolbarButton selected={entryType === "task"} onClick={() => onEntryTypeChange("task")}>
          <SquareIcon className="size-4" />
          Task
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <BaseButton
      type="button"
      onClick={onClick}
      className={cx(
        "flex px-2.5 py-1.5 gap-2 items-center justify-center rounded-lg text-cloud-medium data-active:scale-105 transition-all",
        selected && "bg-slate-dark text-ivory-light",
      )}
    >
      {children}
    </BaseButton>
  );
}
