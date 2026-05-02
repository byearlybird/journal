import { DiamondIcon } from "@phosphor-icons/react";
import { formatTime } from "@/utils/dates";
import { moodColor } from "@/utils/mood-color";
import { moodLabel } from "@/utils/mood-label";
import { EntryShell, EntryGlyphButton, type EntryProps } from "./entry";

export function MoodEntry({
  content,
  created_at,
  value,
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
          <DiamondIcon
            className="size-4"
            style={{ color: moodColor((value ?? 0) / 100) }}
          />
        </EntryGlyphButton>
      }
      meta={
        <>
          {formatTime(created_at)}
          {value !== null && <span>· {moodLabel(value)}</span>}
        </>
      }
    />
  );
}
