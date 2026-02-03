import { tasksRepo } from "@app/db";
import { useUpdateTaskStatus } from "@app/features/tasks";
import { CaretLeftIcon } from "@phosphor-icons/react";
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

  const handleBack = () => {
    if (from === "index") {
      navigate({ to: "/app" });
    } else if (from === "entries") {
      navigate({ to: "/app/entries" });
    } else {
      navigate({ to: "/app" });
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
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-95"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
        <time className="flex-1 text-center font-medium" dateTime={task.date}>
          {formattedDate}
        </time>
        <div className="size-10 shrink-0" aria-hidden />
      </header>
      {/* Content area */}
      <main className="flex-1 px-4 pb-4">
        <div className="rounded-md border border-white/10 bg-white/5 p-4">{task.content}</div>
      </main>
      {/* Action section - incomplete only */}
      {task.status === "incomplete" && (
        <section className="flex w-full gap-2 px-4 pb-safe-bottom pt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 rounded-md border border-white/20 bg-white/5 py-3 font-medium transition-transform active:scale-95 disabled:opacity-50"
          >
            Cancel task
          </button>
          <button
            type="button"
            onClick={handleComplete}
            className="flex-1 rounded-md bg-yellow-500 py-3 font-medium text-black transition-transform active:scale-95 disabled:opacity-50"
          >
            Complete
          </button>
        </section>
      )}
    </div>
  );
}
