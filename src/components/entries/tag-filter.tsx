import type { Tag } from "@/models";
import { FunnelSimpleIcon } from "@phosphor-icons/react";
import { Select } from "@base-ui/react/select";

type TagFilterProps = {
  allTags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
};

export function TagFilter({ allTags, selectedTagIds, onChange }: TagFilterProps) {
  const active = selectedTagIds.length > 0;

  return (
    <Select.Root multiple value={selectedTagIds} onValueChange={onChange}>
      <Select.Trigger
        className={`flex cursor-default items-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm outline-none transition-colors data-popup-open:border-cloud-dark focus-visible:border-cloud-dark ${active ? "text-ivory-dark" : "text-cloud-medium"}`}
      >
        <FunnelSimpleIcon className="size-3.5 shrink-0" />
        <Select.Value>
          {active
            ? allTags
              .filter((t) => selectedTagIds.includes(t.id))
              .map((t) => t.name)
              .join(", ")
            : "Filter"}
        </Select.Value>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="z-50" side="bottom" align="end" sideOffset={4}>
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
