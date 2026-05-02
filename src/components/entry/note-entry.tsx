import { CircleIcon, PushPinSimpleIcon } from "@phosphor-icons/react";
import { notesService } from "@/services/note-service";
import { formatTime } from "@/utils/dates";
import { EntryShell, EntryGlyphButton, type EntryProps } from "./entry";

export function NoteEntry({
  id,
  content,
  created_at,
  pinned,
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
        <EntryGlyphButton onClick={() => notesService.togglePin(id)}>
          <CircleIcon className="size-4" />
        </EntryGlyphButton>
      }
      meta={
        <>
          {formatTime(created_at)}
          {pinned === 1 && <PushPinSimpleIcon className="size-3" />}
        </>
      }
    />
  );
}
