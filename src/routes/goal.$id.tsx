import { Button } from "@/components/common/button";
import {
  MenuButton,
  MenuContent,
  MenuItem,
  MenuRoot,
  TextContent,
  TextareaDialog,
} from "@/components";
import { SwipeBackEdge } from "@/components/navigation/swipe-back-edge";
import { goalService } from "@/app";
import { useMutation } from "@/utils/use-mutation";
import {
  ArrowCounterClockwiseIcon,
  CaretLeftIcon,
  PencilSimpleIcon,
  StarIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

const searchSchema = z.object({
  from: z.enum(["index", "entries"]).optional().catch(undefined),
});

export const Route = createFileRoute("/goal/$id")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  loader: async ({ params }) => {
    const goal = await goalService.get(params.id);
    if (!goal) {
      throw notFound();
    }
    return { goal };
  },
});

function RouteComponent() {
  const { goal } = Route.useLoaderData();
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const mutation = useMutation();

  const isComplete = goal.status === "complete";

  const goBack = () => {
    if (from === "entries") {
      navigate({ to: "/app/entries", viewTransition: { types: ["slide-right"] } });
    } else {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    }
  };

  return (
    <div className="flex min-h-screen flex-col max-w-2xl mx-auto pt-safe-top pb-safe-bottom">
      <header className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={goBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
        <div className="flex-1 text-center">
          <span className="font-medium">Goal</span>
        </div>
        <MenuRoot>
          <MenuButton />
          <MenuContent>
            <MenuItem onClick={() => setEditOpen(true)}>
              <PencilSimpleIcon className="size-4" />
              Edit
            </MenuItem>
            <MenuItem
              onClick={async () => {
                await mutation(() => goalService.delete(goal.id));
                goBack();
              }}
              variant="destructive"
            >
              <TrashIcon className="size-4" />
              Delete
            </MenuItem>
          </MenuContent>
        </MenuRoot>
      </header>

      <TextContent content={goal.content} updatedAt={goal.updatedAt} createdAt={goal.createdAt} />

      <section className="flex w-full gap-2 px-4 pb-safe-bottom pt-2">
        {isComplete ? (
          <Button
            variant="slate"
            onClick={() => mutation(() => goalService.setStatus(goal.id, "incomplete"))}
          >
            <ArrowCounterClockwiseIcon />
            Complete
          </Button>
        ) : (
          <Button onClick={() => mutation(() => goalService.setStatus(goal.id, "complete"))}>
            <StarIcon />
            Complete
          </Button>
        )}
      </section>

      <TextareaDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={async (content) => {
          await mutation(() => goalService.update(goal.id, { content }));
          setEditOpen(false);
        }}
        title="Edit goal"
        initialContent={goal.content}
      />
      <SwipeBackEdge onBack={goBack} />
    </div>
  );
}
