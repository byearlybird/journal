import { Button } from "@app/components/button";
import {
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuRoot,
  MenuTrigger,
} from "@app/components";
import { tasksRepo } from "@app/db";
import { useUpdateTaskStatus } from "@app/features/tasks";
import {
  ArrowCounterClockwiseIcon,
  CaretLeftIcon,
  CheckCircleIcon,
  DotsThreeIcon,
  TrashIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import z from "zod";

const taskSearchSchema = z.object({
  from: z.enum(["index", "entries"]).optional().catch(undefined),
});

export const Route = createFileRoute("/task/$id")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => taskSearchSchema.parse(search),
  loader: async ({ params }) => {
    const task = await tasksRepo.findById(params.id);
    if (!task) {
      throw notFound();
    }
    return {
      task,
    };
  },
});

function RouteComponent() {
  const { task } = Route.useLoaderData();
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();
  const updateTaskStatus = useUpdateTaskStatus();

  const handleComplete = () => {
    updateTaskStatus({ id: task.id, status: "complete" });
  };

  const handleCancel = () => {
    updateTaskStatus({ id: task.id, status: "canceled" });
  };

  const handleReset = () => {
    updateTaskStatus({ id: task.id, status: "incomplete" });
  };

  const handleDelete = () => {
    tasksRepo.delete(task.id);
    handleBack();
  };

  const handleBack = () => {
    if (from === "index") {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    } else if (from === "entries") {
      navigate({ to: "/app/entries", viewTransition: { types: ["slide-right"] } });
    } else {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    }
  };

  const formattedDate = format(parseISO(task.date), "EEE MMM d ''yy");

  return (
    <div className="flex min-h-screen flex-col max-w-2xl mx-auto pt-safe-top pb-safe-bottom">
      {/* Header row */}
      <header className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={handleBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
        <time className="flex-1 text-center font-medium" dateTime={task.date}>
          {formattedDate}
        </time>
        <MenuRoot>
          <MenuTrigger className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105">
            <DotsThreeIcon className="size-6" />
          </MenuTrigger>
          <MenuPortal>
            <MenuPositioner align="end">
              <MenuPopup>
                <MenuItem onClick={handleDelete} className="text-error flex gap-2">
                  <TrashIcon className="size-4" />
                  Delete
                </MenuItem>
              </MenuPopup>
            </MenuPositioner>
          </MenuPortal>
        </MenuRoot>
      </header>
      {/* Content area */}
      <section className="flex-1 p-4">
        <div className="rounded-md p-4 items-center flex">{task.content}</div>
      </section>
      {/* Controls section */}
      <section className="flex w-full gap-2 px-4 pb-safe-bottom pt-2">
        {task.status === "incomplete" ? (
          <>
            <Button onClick={handleCancel} variant="slate">
              <XCircleIcon />
              Cancel task
            </Button>
            <Button onClick={handleComplete}>
              <CheckCircleIcon />
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
    </div>
  );
}
