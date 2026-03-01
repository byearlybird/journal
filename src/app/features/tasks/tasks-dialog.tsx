import type { Task } from "@/app/idb";
import {
  DialogBackdrop,
  DialogClose,
  DialogPopup,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "@/app/components/dialog";
import { XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { TaskItem, useUpdateTaskStatus } from "@/app/features/tasks";

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
      <AnimatePresence>
        {open && (
          <DialogPortal keepMounted>
            <DialogBackdrop
              render={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              }
            />
            <div className="fixed inset-x-0 bottom-0 flex h-3/4 w-full max-w-2xl mx-auto">
              <DialogPopup
                className="flex h-full w-full flex-col overflow-y-auto p-2 pb-[calc(var(--safe-bottom)+var(--spacing)*2)]"
                render={
                  <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  />
                }
              >
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
            </div>
          </DialogPortal>
        )}
      </AnimatePresence>
    </DialogRoot>
  );
}
