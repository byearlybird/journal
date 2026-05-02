import { TriangleIcon } from "@phosphor-icons/react";
import { useBlobUrl } from "@/hooks/use-blob";
import { formatTime } from "@/utils/dates";
import { EntryShell, EntryGlyphButton, type EntryProps } from "./entry";

export function MomentEntry({
  content,
  created_at,
  image_blob_id,
  thumbnail_blob_id,
  label_name,
  onClick,
  compact,
}: EntryProps) {
  const blobId = thumbnail_blob_id ?? image_blob_id;
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
      trailing={blobId ? <MomentThumbnail blobId={blobId} /> : null}
    />
  );
}

function MomentThumbnail({ blobId }: { blobId: string }) {
  const url = useBlobUrl(blobId);

  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      className="size-16 self-center object-cover rounded-lg border border-border shrink-0"
    />
  );
}
