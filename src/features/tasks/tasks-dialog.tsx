import type { Task } from "@app/db";
import {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "@app/components/dialog";
import { XIcon } from "@phosphor-icons/react";
import { TaskItem, useUpdateTaskStatus } from "@app/features/tasks";

export function TasksDialog({
  incompleteTasks,
  open,
  onClose,
}: {
  incompleteTasks: Task[];
  open: boolean;
  onClose: () => void;
}) {
  const updateTaskStatus = useUpdateTaskStatus();

  const handleStatusChange = (id: string, status: Task["status"]) => {
    updateTaskStatus({ id, status });
  };

  return (
    <DialogRoot open={open} onOpenChange={onClose}>
      <DialogPortal keepMounted>
        <DialogBackdrop />
        <DialogPopup className="bottom-2 h-3/4 pb-[calc(var(--safe-bottom)+var(--spacing)*2)] data-starting-style:translate-y-full data-ending-style:translate-y-full">
                <DialogTitle>Tasks</DialogTitle>
                <div className="sticky top-0 z-10 flex items-center justify-between bg-slate-medium p-2">
                  <DialogClose className="flex size-8 ms-auto items-center justify-center rounded-full border bg-slate-medium text-ivory-light transition-transform duration-100 ease-in-out active:scale-105">
                    <XIcon className="h-4 w-4" />
                  </DialogClose>
                </div>
                <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-2 px-4">
                  {incompleteTasks.length > 0 ? (
                    <div className="flex flex-col gap-2 divide-y divide-dashed divide-slate-light">
                      {incompleteTasks.map((task) => (
                        <div key={task.id} className="py-2">
                          <TaskItem task={task} onStatusChange={handleStatusChange} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex size-full flex-col items-center justify-center">
                      <p className="p-6 text-sm text-cloud-medium">You're all caught up</p>
                    </div>
                  )}
                </div>
        </DialogPopup>
      </DialogPortal>
    </DialogRoot>
  );
}
