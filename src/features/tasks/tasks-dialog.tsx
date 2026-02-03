import type { Task } from "@app/db";
import { Dialog, DialogPanel } from "@headlessui/react";
import { XIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
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
    <AnimatePresence>
      {open && (
        <Dialog static open={open} onClose={onClose} className="relative z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70"
          />
          <div className="fixed inset-x-0 bottom-0 flex h-svh w-screen items-end justify-center p-2 pb-safe-bottom">
            <DialogPanel
              as={motion.div}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative flex h-1/2 w-full max-w-2xl flex-col rounded-lg border bg-graphite overflow-clip"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between bg-graphite px-4 py-2">
                {/* <DialogTitle className="text-white">Tasks</DialogTitle> */}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-full border bg-graphite text-white transition-transform duration-100 ease-in-out active:scale-95"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-2 px-4">
                {incompleteTasks.length > 0 ? (
                  <div className="flex flex-col gap-2 divide-y divide-dashed divide-white/10">
                    {incompleteTasks.map((task) => (
                      <div key={task.id} className="py-2">
                        <TaskItem task={task} onStatusChange={handleStatusChange} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex size-full flex-col items-center justify-center">
                    <p className="p-6 text-sm text-white/50">You're all caught up</p>
                  </div>
                )}
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
