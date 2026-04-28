import type { ReactElement } from "react";
import type { DBSchema } from "@/db/schema";
import { usePriorTasks } from "@/hooks/use-prior-tasks";
import { useTodayDate } from "@/hooks/use-today-date";
import { relativeDate } from "@/utils/dates";
import { ArrowSquareRightIcon, CheckSquareIcon, XSquareIcon } from "@phosphor-icons/react";
import { taskService } from "@/services/task-service";
import { openEntryDetail } from "@/stores/entry-detail";
import { SidebarPopover } from "@/components/shared/sidebar-popover";

type Task = DBSchema["tasks"];

export function RolloverTasksPreview({ children }: { children: ReactElement }) {
  const tasks = usePriorTasks();
  const today = useTodayDate();

  const groups = tasks?.reduce<Map<string, Task[]>>((map, task) => {
    const label = relativeDate(task.date, today);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(task);
    return map;
  }, new Map());

  return (
    <SidebarPopover trigger={children}>
      {groups && groups.size > 0 ? (
        [...groups.entries()].map(([label, groupTasks]) => (
          <div key={label}>
            <div className={`px-2 pt-2 pb-1 text-xs font-medium ${groupTasks[0].date < today ? "text-accent" : "text-foreground-muted"}`}>
              {label}
            </div>
            {groupTasks.map((task) => (
              <RolloverTaskRow key={task.id} task={task} isPrior={task.date < today} />
            ))}
          </div>
        ))
      ) : (
        <div className="px-2 py-3 text-sm text-foreground-muted">No incomplete tasks</div>
      )}
    </SidebarPopover>
  );
}

function RolloverTaskRow({ task, isPrior }: { task: Task; isPrior: boolean }) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="w-full rounded-lg px-2 py-2 text-start hover:bg-surface-tint transition-colors cursor-default"
      onClick={() => openEntryDetail(task.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") openEntryDetail(task.id); }}
    >
      <div className="flex items-center gap-1">
        <div className="text-sm text-foreground line-clamp-2 flex-1 min-w-0">{task.content}</div>
        <div className="flex items-center gap-0.5 shrink-0">
          <ActionButton onClick={() => taskService.setStatus(task.id, "cancelled")} label="Cancel">
            <XSquareIcon />
          </ActionButton>
          {isPrior && (
            <ActionButton onClick={() => taskService.rolloverTask(task.id)} label="Defer">
              <ArrowSquareRightIcon />
            </ActionButton>
          )}
          <ActionButton onClick={() => taskService.setStatus(task.id, "complete")} label="Complete">
            <CheckSquareIcon />
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  label,
}: {
  children: ReactElement;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="p-1 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-tint transition-colors [&>svg]:size-4"
    >
      {children}
    </button>
  );
}
