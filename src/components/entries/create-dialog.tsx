import { cx } from "cva";
import { Button as BaseButton } from "@base-ui/react";
import { Button } from "@/components/common/button";
import { DialogContent, DialogFooter, DialogRoot, DialogTitle } from "@/components/common/dialog";
import { CircleIcon, SquareIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { noteService, taskService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import { Editor, useEditor, readEditorContent } from "@/components/lexical";
import { $getRoot, $createParagraphNode } from "lexical";

export function CreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mutation = useMutation();
  const editor = useEditor();
  const [isEmpty, setIsEmpty] = useState(true);
  const [entryType, setEntryType] = useState<"note" | "task">("note");

  const handleClose = () => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
    setIsEmpty(true);
    setEntryType("note");
    onClose();
  };

  const handleSave = () => {
    const content = readEditorContent(editor);
    if (!content) return;

    if (entryType === "note") {
      void mutation(() => noteService.create(content));
    } else if (entryType === "task") {
      void mutation(() => taskService.create(content));
    }

    handleClose();
  };

  return (
    <DialogRoot open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>Create a new entry</DialogTitle>
        <Editor editor={editor} onEmptyChange={setIsEmpty} placeholder="What's on your mind?" />
        <DialogFooter>
          <Button onClick={handleClose} variant="slate">
            Cancel
          </Button>
          <Button disabled={isEmpty} onClick={handleSave} variant="gold">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
      {open &&
        createPortal(
          <div
            className="fixed right-2 z-50 flex items-center gap-1 rounded-lg border bg-slate-medium px-2 py-1"
            style={{ bottom: "calc(var(--keyboard-height) + var(--spacing)*3)" }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <EntryTypeToggle entryType={entryType} onEntryTypeChange={setEntryType} />
          </div>,
          document.body,
        )}
    </DialogRoot>
  );
}

function EntryTypeToggle({
  entryType,
  onEntryTypeChange,
}: {
  entryType: "note" | "task";
  onEntryTypeChange: (type: "note" | "task") => void;
}) {
  return (
    <div className="flex w-fit shrink-0 gap-2">
      <EntryTypeButton selected={entryType === "note"} onClick={() => onEntryTypeChange("note")}>
        <CircleIcon className="size-4" />
        Note
      </EntryTypeButton>
      <EntryTypeButton selected={entryType === "task"} onClick={() => onEntryTypeChange("task")}>
        <SquareIcon className="size-4" />
        Task
      </EntryTypeButton>
    </div>
  );
}

function EntryTypeButton({
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
      onMouseDown={(e) => e.preventDefault()}
      className={cx(
        "flex px-2 py-1 rounded-md gap-2 items-center justify-center text-cloud-medium data-active:scale-105 transition-all",
        selected && "bg-slate-dark text-ivory-light",
      )}
    >
      {children}
    </BaseButton>
  );
}
