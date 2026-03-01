import { Button } from "@/app/components/button";
import {
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
  TextContent,
} from "@/app/components";
import { tasksRepo } from "@/app/idb";
import { EditTaskDialog, useUpdateTaskStatus } from "@/app/features/tasks";
import { useLocalData } from "@/app/hooks/use-local-data";
import { navigate } from "@/app/utils/navigate";
import {
  ArrowCounterClockwiseIcon,
  CaretLeftIcon,
  CheckSquareIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  TrashIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import { format, parseISO } from "date-fns";
import { useState } from "react";

export function TaskPage({ id }: { id: string }) {
  const task = useLocalData(() => tasksRepo.findById(id), [id]);
  const updateTaskStatus = useUpdateTaskStatus();
  const [editOpen, setEditOpen] = useState(false);
  const from = new URLSearchParams(window.location.search).get("from") as
    | "index"
    | "entries"
    | null;

  const handleComplete = () => {
    if (!task) return;
    updateTaskStatus({ id: task.id, status: "complete" });
  };

  const handleCancel = () => {
    if (!task) return;
    updateTaskStatus({ id: task.id, status: "canceled" });
  };

  const handleReset = () => {
    if (!task) return;
    updateTaskStatus({ id: task.id, status: "incomplete" });
  };

  const handleBack = () => {
    if (from === "entries") {
      navigate("entries", undefined, { transition: "slide-right" });
    } else {
      navigate("app", undefined, { transition: "slide-right" });
    }
  };

  const handleDelete = () => {
    if (!task) return;
    tasksRepo.delete(task.id);
    handleBack();
  };

  if (!task) return null;

  const formattedDate = format(parseISO(task.date), "MMMM d");
  const createdTime = format(parseISO(task.createdAt), "h:mm a");

  return (
    <div className="flex min-h-screen flex-col max-w-2xl mx-auto pt-safe-top pb-safe-bottom">
      <header className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={handleBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
        <div className="flex-1 text-center flex flex-col justify-between gap-2">
          <time className="font-medium" dateTime={task.date}>
            {formattedDate}
          </time>
          <time className="block text-xs text-cloud-medium" dateTime={task.createdAt}>
            {createdTime}
          </time>
        </div>
        <MenuRoot>
          <MenuTrigger className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105">
            <DotsThreeIcon className="size-6" />
          </MenuTrigger>
          <MenuPortal>
            <MenuPositioner align="end">
              <MenuPopup>
                <MenuItem onClick={() => setEditOpen(true)} className="flex gap-2">
                  <PencilSimpleIcon className="size-4" />
                  Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} className="text-error flex gap-2">
                  <TrashIcon className="size-4" />
                  Delete
                </MenuItem>
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </MenuRoot>
      </header>
      <TextContent content={task.content} updatedAt={task.updatedAt} createdAt={task.createdAt} />
      <section className="flex w-full gap-2 px-4 pb-safe-bottom pt-2">
        {task.status === "incomplete" ? (
          <>
            <Button onClick={handleCancel} variant="slate">
              <XSquareIcon />
              Cancel task
            </Button>
            <Button onClick={handleComplete}>
              <CheckSquareIcon />
              Complete
            </Button>
          </>
        ) : (
          <Button variant="slate" onClick={handleReset}>
            <ArrowCounterClockwiseIcon />
            {task.status === "complete" ? "Complete" : "Canceled"}
          </Button>
        )}
      </section>
      <EditTaskDialog open={editOpen} onClose={() => setEditOpen(false)} task={task} />
    </div>
  );
}
