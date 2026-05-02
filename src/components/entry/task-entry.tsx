import {
  ArrowSquareRightIcon,
  CheckSquareIcon,
  SquareIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import type { TaskTable } from "@/db/schema";
import { taskService } from "@/services/task-service";
import { formatTime } from "@/utils/dates";
import { EntryShell, EntryGlyphButton, type EntryProps } from "./entry";

function TaskIcon({ status }: { status: TaskTable["status"] | null }) {
  switch (status) {
    case "complete":
      return <CheckSquareIcon className="size-4 text-accent" />;
    case "cancelled":
      return <XSquareIcon className="size-4 text-foreground-muted" />;
    case "deferred":
      return <ArrowSquareRightIcon className="size-4 text-foreground-muted" />;
    default:
      return <SquareIcon className="size-4" />;
  }
}

export function TaskEntry({
  id,
  content,
  created_at,
  status,
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
        <EntryGlyphButton onClick={() => taskService.cycleStatus(id)}>
          <TaskIcon status={status} />
        </EntryGlyphButton>
      }
      meta={formatTime(created_at)}
    />
  );
}
