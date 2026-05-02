import { TriangleIcon } from "@phosphor-icons/react";
import { useBlobUrl } from "@/hooks/use-blob";
import { useEntry } from "@/hooks/use-entry";
import { formatTime } from "@/utils/dates";
import { EntryShell, EntryGlyphButton, type EntryProps } from "./entry";

export function MomentEntry({
  id,
  content,
  created_at,
  has_image,
  label_name,
  onClick,
  compact,
}: EntryProps) {
  return (
    <EntryShell
      onClick={onClick}
      compact={compact}
      content={content}
      label_name={label_name}
      glyph={
        <EntryGlyphButton>
          <TriangleIcon className="size-4" />
        </EntryGlyphButton>
      }
      meta={formatTime(created_at)}
      trailing={has_image === 1 ? <MomentThumbnail id={id} /> : null}
    />
  );
}

function MomentThumbnail({ id }: { id: string }) {
  const moment = useEntry("moment", id);
  const url = useBlobUrl(moment?.thumbnail_blob_id ?? moment?.image_blob_id);

  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      className="size-16 self-center object-cover rounded-lg border border-border shrink-0"
    />
  );
}
