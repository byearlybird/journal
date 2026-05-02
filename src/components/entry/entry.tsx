import { TagSimpleIcon } from "@phosphor-icons/react";
import type { DBSchema } from "@/db/schema";
import clsx from "clsx";
import type { MouseEventHandler, ReactNode } from "react";
import { NoteEntry } from "./note-entry";
import { TaskEntry } from "./task-entry";
import { MoodEntry } from "./mood-entry";
import { MomentEntry } from "./moment-entry";

type TimelineView = DBSchema["timeline"];
export type EntryProps = TimelineView & {
  onClick?: () => void;
  compact?: boolean;
};

export function Entry(props: EntryProps) {
  switch (props.type) {
    case "note":
      return <NoteEntry {...props} />;
    case "task":
      return <TaskEntry {...props} />;
    case "mood":
      return <MoodEntry {...props} />;
    case "moment":
      return <MomentEntry {...props} />;
  }
}

export function EntryShell({
  glyph,
  meta,
  content,
  compact,
  label_name,
  trailing,
  onClick,
}: {
  glyph: ReactNode;
  meta: ReactNode;
  content: string | null;
  compact?: boolean;
  label_name: string | null;
  trailing?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className="rounded-xl px-2 py-4 mb-4 hover:bg-surface-tint transition-all flex gap-2.5"
      onClick={onClick}
    >
      {glyph}
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="text-xs text-foreground-muted flex items-center gap-1">{meta}</div>
        {content !== null && content !== "" && (
          <div
            className={clsx("font-serif whitespace-pre-wrap", compact && "text-sm line-clamp-3")}
          >
            {content}
          </div>
        )}
        {label_name && (
          <div className="flex items-center gap-1 text-xs text-foreground-muted">
            <TagSimpleIcon className="size-3" />
            {label_name}
          </div>
        )}
      </div>
      {trailing}
    </div>
  );
}

export function EntryGlyphButton({
  onClick,
  children,
}: {
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}) {
  if (!onClick) {
    return <span className="self-start p-0.5 -mt-0.5">{children}</span>;
  }
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onClick(e);
  };
  return (
    <button
      onClick={handleClick}
      className="self-start rounded-lg hover:bg-surface-tint p-0.5 -mt-0.5"
    >
      {children}
    </button>
  );
}
