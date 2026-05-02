import { TriangleIcon } from "@phosphor-icons/react";
import { useBlob } from "@/hooks/use-blob";
import { useEntry } from "@/hooks/use-entry";
import { formatTime } from "@/utils/dates";
import { useEffect, useState } from "react";
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
  const blobId = moment?.thumbnail_blob_id ?? moment?.image_blob_id ?? null;
  const bytes = useBlob(blobId);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!bytes) {
      setUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(new Blob([new Uint8Array(bytes)]));
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [bytes]);

  if (!url) return null;
  return (
    <img
      src={url}
      alt=""
      className="size-16 self-center object-cover rounded-lg border border-border shrink-0"
    />
  );
}
