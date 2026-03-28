import { cx } from "cva";
import { Button as BaseButton } from "@base-ui/react";
import { Drawer } from "@base-ui/react/drawer";
import { Button } from "@/components/common/button";
import { DrawerRoot, DrawerContent, DrawerTitle } from "@/components/common/drawer";
import { TagPicker } from "@/components/entries/tag-picker";
import { TagFilterContext } from "@/contexts/tag-filter-context";
import { CircleIcon, SquareIcon, XIcon } from "@phosphor-icons/react";
import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { noteService, taskService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import type { Tag } from "@/models";
import { Editor, useEditor, readEditorContent } from "@/components/lexical";
import { $getRoot, $createParagraphNode } from "lexical";

export function CreateDialog({ open, onClose, allTags }: { open: boolean; onClose: () => void; allTags: Tag[] }) {
  const mutation = useMutation();
  const editor = useEditor();
  const [isEmpty, setIsEmpty] = useState(true);
  const [entryType, setEntryType] = useState<"note" | "task">("note");
  const [filterTagIds] = useContext(TagFilterContext);
  const [selectedTagIds, setSelectedTagIds] = useState(filterTagIds);

  useEffect(() => {
    if (open) setSelectedTagIds(filterTagIds);
  }, [open]);

  const handleClose = () => {
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      root.append($createParagraphNode());
    });
    setIsEmpty(true);
    setEntryType("note");
    setSelectedTagIds(filterTagIds);
    onClose();
  };

  const handleSave = () => {
    const content = readEditorContent(editor);
    if (!content) return;

    if (entryType === "note") {
      void mutation(() => noteService.create(content, selectedTagIds));
    } else if (entryType === "task") {
      void mutation(() => taskService.create(content, selectedTagIds));
    }

    handleClose();
  };

  return (
    <DrawerRoot open={open} onOpenChange={handleClose}>
      <DrawerContent fullHeight>
        <DrawerTitle>Create a new entry</DrawerTitle>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center px-2 pb-2">
          <Drawer.Close className="flex size-8 items-center justify-center justify-self-start rounded-full border bg-slate-medium text-ivory-light transition-transform duration-100 ease-in-out active:scale-105 [&>svg]:size-4">
            <XIcon />
          </Drawer.Close>
          <TagPicker
            allTags={allTags}
            selectedTagIds={selectedTagIds}
            onAdd={(tagId) => setSelectedTagIds((prev) => [...prev, tagId])}
            onRemove={(tagId) => setSelectedTagIds((prev) => prev.filter((id) => id !== tagId))}
            side="bottom"
          />
          <Button
            disabled={isEmpty}
            onClick={handleSave}
            size="sm"
            variant="gold"
            rounded="full"
            className="flex-none justify-self-end"
          >
            Save
          </Button>
        </div>
        <Editor editor={editor} onEmptyChange={setIsEmpty} placeholder="What's on your mind?" />
      </DrawerContent>
      {open &&
        createPortal(
          <div
            className="fixed right-2 z-50 flex items-center gap-1 rounded-lg border bg-slate-medium px-2 py-1"
            style={{ bottom: "calc(max(var(--keyboard-height), env(safe-area-inset-bottom, 0px)) + var(--spacing)*3)" }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <EntryTypeToggle entryType={entryType} onEntryTypeChange={setEntryType} />
          </div>,
          document.body,
        )}
    </DrawerRoot>
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
