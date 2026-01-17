import { Dialog, DialogPanel, DialogTitle, Textarea } from "@headlessui/react";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { useCreateNote } from "./use-notes";

type CreateDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function CreateDialog({ open, onClose }: CreateDialogProps) {
  let hasFocused = false;
  const { mutate: createNote } = useCreateNote();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState<string>("");

  const handleSave = () => {
    if (content.trim() === "") return;
    createNote({ content: content.trim() });
    setContent("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog static open={open} onClose={onClose} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50"
          />
          <div className="fixed inset-x-0 top-0 flex h-svh w-screen justify-center p-2">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, y: -100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              onAnimationComplete={() => {
                if (!hasFocused) {
                  inputRef.current?.focus();
                  hasFocused = true;
                }
              }}
              className="flex h-1/2 w-full max-w-2xl flex-col space-y-4 overflow-y-auto rounded-lg border bg-graphite"
            >
              <DialogTitle className="sr-only">Create a new entry</DialogTitle>
              <Textarea
                ref={inputRef}
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="scrollbar-hide h-full w-full resize-none p-4 placeholder:text-white/50 focus:outline-none"
              />
              <div className="right-0 left-0 flex justify-between gap-4 p-4">
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
