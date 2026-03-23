import { DialogContent, DialogFooter, DialogRoot, DialogTitle } from "@/components/common/dialog";
import { Button } from "@/components/common/button";
import { useState } from "react";
import { Editor, useEditor, readEditorContent } from "@/components/lexical";

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
  initialContent?: string;
}) {
  const editor = useEditor();
  const [isEmpty, setIsEmpty] = useState(!initialContent);

  const handleClose = () => {
    onClose();
  };

  const handleSave = () => {
    const content = readEditorContent(editor);
    if (!content) return;
    onSave(content);
    handleClose();
  };

  return (
    <DialogRoot open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <Editor
          editor={editor}
          initialContent={initialContent}
          onEmptyChange={setIsEmpty}
          placeholder={placeholder}
        />
        <DialogFooter>
          <Button onClick={handleClose} variant="slate">
            Cancel
          </Button>
          <Button disabled={isEmpty} onClick={handleSave} variant="gold">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}
