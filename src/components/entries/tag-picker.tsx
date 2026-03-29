import type { Tag } from "@/models";
import { TagSimpleIcon } from "@phosphor-icons/react";
import { Select } from "@base-ui/react/select";
import { useOptimistic } from "react";

type TagPickerProps = {
  allTags: Tag[];
  selectedTagIds: string[];
  onAdd: (tagId: string) => void;
  onRemove: (tagId: string) => void;
  side?: "top" | "bottom";
};

export function TagPicker({
  allTags,
  selectedTagIds,
  onAdd,
  onRemove,
  side = "top",
}: TagPickerProps) {
  const [optimisticTagIds, setOptimisticTagIds] = useOptimistic(selectedTagIds);
  const selectedTags = allTags.filter((t) => optimisticTagIds.includes(t.id));

  return (
    <Select.Root
      multiple
      value={optimisticTagIds}
      onOpenChange={(open) => {
        if (!open) {
          requestAnimationFrame(() => window.dispatchEvent(new Event("editor:refocus")));
        }
      }}
      onValueChange={(newValue) => {
        const added = newValue.find((id) => !optimisticTagIds.includes(id));
        const removed = optimisticTagIds.find((id) => !newValue.includes(id));
        setOptimisticTagIds(newValue);
        if (added) onAdd(added);
        if (removed) onRemove(removed);
      }}
    >
      <Select.Trigger className="flex cursor-default items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm text-cloud-medium outline-none transition-colors data-popup-open:border-cloud-dark focus-visible:border-cloud-dark">
        <TagSimpleIcon className="size-3.5 shrink-0" />
        <Select.Value>
          {selectedTags.length > 0 ? selectedTags.map((t) => t.name).join(", ") : "No tags"}
        </Select.Value>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50" side={side} sideOffset={4}>
          <Select.Popup className="origin-(--transform-origin) rounded-md border border-slate-light bg-slate-dark p-1 text-ivory-dark shadow transition-[transform,scale,opacity] data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0">
            {allTags.map((tag) => (
              <Select.Item
                key={tag.id}
                value={tag.id}
                className="flex cursor-default items-center justify-center rounded-sm px-3 py-2 text-sm text-cloud-medium outline-none data-highlighted:bg-slate-medium data-selected:font-semibold data-selected:text-ivory-dark"
              >
                <Select.ItemText>{tag.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
