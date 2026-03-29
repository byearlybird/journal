import { Button } from "@/components/common/button";
import {
  MenuButton,
  MenuContent,
  MenuItem,
  MenuRoot,
  TagPicker,
  TextContent,
  TextareaDialog,
} from "@/components";
import {
  DetailPage,
  DetailPageHeader,
  DetailPageActions,
  DetailPageTitle,
} from "@/components/page/detail-page";
import { taskService } from "@/app";
import { allTagsQueryOptions, taskQueryOptions, rolledTaskQueryOptions } from "@/queries";
import { useMutation } from "@/utils/use-mutation";
import {
  ArrowCounterClockwiseIcon,
  ArrowSquareRightIcon,
  CheckSquareIcon,
  PencilSimpleIcon,
  TrashIcon,
  XSquareIcon,
} from "@phosphor-icons/react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { useState } from "react";
import z from "zod";

const taskSearchSchema = z.object({
  from: z.enum(["index", "entries"]).optional().catch(undefined),
});

export const Route = createFileRoute("/task/$id")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => taskSearchSchema.parse(search),
  loader: async ({ params, context: { queryClient } }) => {
    const [task] = await Promise.all([
      queryClient.ensureQueryData(taskQueryOptions(params.id)),
      queryClient.ensureQueryData(allTagsQueryOptions()),
    ]);
    if (!task) throw notFound();
    if (task.status === "deferred") {
      await queryClient.ensureQueryData(rolledTaskQueryOptions(task.id));
    }
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data: task } = useSuspenseQuery(taskQueryOptions(id));
  const { data: allTags } = useSuspenseQuery(allTagsQueryOptions());
  const { data: rolledTask } = useQuery({
    ...rolledTaskQueryOptions(task?.id ?? ""),
    enabled: task?.status === "deferred",
  });
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();
  const mutation = useMutation();
  const [editOpen, setEditOpen] = useState(false);

  if (!task) return null;

  const handleComplete = () => {
    mutation(() => taskService.update(task.id, { status: "complete" }));
  };

  const handleCancel = () => {
    mutation(() => taskService.update(task.id, { status: "canceled" }));
  };

  const handleReset = () => {
    mutation(() => taskService.update(task.id, { status: "incomplete" }));
  };

  const handleDelete = () => {
    taskService.delete(task.id);
    handleBack();
  };

  const handleBack = () => {
    if (from === "index") {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    } else if (from === "entries") {
      navigate({
        to: "/app",
        search: { view: "entries" },
        viewTransition: { types: ["slide-right"] },
      });
    } else {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    }
  };

  const formattedDate = format(parseISO(task.date), "MMMM d");
  const createdTime = format(parseISO(task.createdAt), "h:mm a");

  return (
    <DetailPage onGoBack={handleBack}>
      {/* Header row */}
      <DetailPageHeader>
        <DetailPageTitle>
          <time className="font-medium" dateTime={task.date}>
            {formattedDate}
          </time>
          <time className="block text-xs text-cloud-medium" dateTime={task.createdAt}>
            {createdTime}
          </time>
        </DetailPageTitle>
        <DetailPageActions>
          <MenuRoot>
            <MenuButton />
            <MenuContent>
              <MenuItem onClick={() => setEditOpen(true)}>
                <PencilSimpleIcon className="size-4" />
                Edit
              </MenuItem>
              <MenuItem onClick={handleDelete} variant="destructive">
                <TrashIcon className="size-4" />
                Delete
              </MenuItem>
            </MenuContent>
          </MenuRoot>
        </DetailPageActions>
      </DetailPageHeader>
      {/* Content area */}
      <TextContent content={task.content} updatedAt={task.updatedAt} createdAt={task.createdAt} />
      {/* Tag picker */}
      <div className="mt-auto flex justify-center px-4 pt-2 pb-3">
        <TagPicker
          allTags={allTags}
          selectedTagIds={task.tags.map((t) => t.id)}
          onAdd={(tagId) => mutation(() => taskService.addTag(task.id, tagId))}
          onRemove={(tagId) => mutation(() => taskService.removeTag(task.id, tagId))}
        />
      </div>
      {/* Controls section */}
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
        ) : task.status === "deferred" ? (
          <Button
            variant="slate"
            disabled={!rolledTask}
            onClick={() =>
              rolledTask &&
              navigate({
                to: "/task/$id",
                params: { id: rolledTask.id },
                search: { from },
                viewTransition: { types: ["slide-left"] },
              })
            }
          >
            <ArrowSquareRightIcon />
            Deferred
          </Button>
        ) : (
          <Button variant="slate" onClick={handleReset}>
            <ArrowCounterClockwiseIcon />
            {task.status === "complete" ? "Complete" : "Canceled"}
          </Button>
        )}
      </section>
      <TextareaDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(content) => mutation(() => taskService.update(task.id, { content }))}
        title="Edit task"
        placeholder="What needs to be done?"
        initialContent={task.content}
      />
    </DetailPage>
  );
}
