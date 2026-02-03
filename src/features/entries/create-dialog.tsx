import { cx } from "cva";
import { Button, Dialog, DialogPanel, DialogTitle, Textarea } from "@headlessui/react";
import { CheckIcon, CircleIcon, SquareIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCreateNote } from "@app/features/notes";
import { useCreateTask } from "@app/features/tasks";

export function CreateDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const createNote = useCreateNote();
  const createTask = useCreateTask();
  const [content, setContent] = useState<string>("");
  const [entryType, setEntryType] = useState<"note" | "task">("note");

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
    <AnimatePresence>
      {open && (
        <Dialog static open={open} onClose={handleClose} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70"
          />
          <div className="fixed inset-x-0 top-0 flex h-svh w-screen justify-center p-2 pt-safe-top">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="flex h-1/2 w-full max-w-2xl flex-col overflow-y-auto rounded-lg border bg-graphite"
            >
              <DialogTitle className="sr-only">Create a new entry</DialogTitle>
              <Toolbar entryType={entryType} onEntryTypeChange={setEntryType} />
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="scrollbar-hide h-full border-t border-dotted w-full resize-none p-4 placeholder:text-white/50 focus:outline-none"
              />
              <div className="flex justify-between gap-4 p-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-11 items-center justify-center rounded-full border"
                >
                  <XIcon className="h-4 w-4" />
                </button>
                <button
                  disabled={content.trim() === ""}
                  type="button"
                  className="flex size-11 items-center justify-center rounded-full bg-yellow text-black disabled:opacity-50"
                  onClick={handleSave}
                >
                  <CheckIcon className="h-4 w-4" />
                </button>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
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
          <SquareIcon className="size-4" />
          Note
        </ToolbarButton>
        <ToolbarButton selected={entryType === "task"} onClick={() => onEntryTypeChange("task")}>
          <CircleIcon className="size-4" />
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
    <Button
      type="button"
      onClick={onClick}
      className={cx(
        "flex px-2.5 py-1.5 gap-2 items-center justify-center rounded-lg text-white/50 data-active:scale-95 transition-all",
        selected && "bg-black/70 text-white/90",
      )}
    >
      {children}
    </Button>
  );
}
