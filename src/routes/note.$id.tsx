import { notesRepo } from "@app/db";
import { CaretLeft } from "@phosphor-icons/react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import z from "zod";

const noteSearchSchema = z.object({
  from: z.enum(["index", "entries"]).optional().catch(undefined),
});

export const Route = createFileRoute("/note/$id")({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => noteSearchSchema.parse(search),
  loader: async ({ params }) => {
    const note = await notesRepo.findById(params.id);
    if (!note) {
      throw notFound();
    }
    return {
      note,
    };
  },
});

function RouteComponent() {
  const { note } = Route.useLoaderData();
  const { from } = Route.useSearch();
  const navigate = Route.useNavigate();

  const handleBack = () => {
    if (from === "index") {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    } else if (from === "entries") {
      navigate({ to: "/app/entries", viewTransition: { types: ["slide-right"] } });
    } else {
      navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
    }
  };

  const formattedDate = format(parseISO(note.date), "EEE MMM d ''yy");

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
          <CaretLeft className="size-6" />
        </button>
        <time className="flex-1 text-center font-medium" dateTime={note.date}>
          {formattedDate}
        </time>
        <div className="size-10 shrink-0" aria-hidden />
      </header>
      {/* Content area */}
      <section className="flex-1 px-4 pb-4">
        <div className="rounded-md p-4 items-center flex">{note.content}</div>
      </section>
    </div>
  );
}
