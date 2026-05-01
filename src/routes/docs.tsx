import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { docs } from "@/lib/docs";

export const Route = createFileRoute("/docs")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-row flex-1 size-full overflow-hidden">
      <section className="flex flex-col shrink-0 min-w-50 space-y-2 border-r border-border p-2 pr-4">
        {docs.map((doc, i) =>
          i === 0 ? (
            <Link
              key={doc.slug}
              to="/docs"
              activeOptions={{ exact: true }}
              className="shrink-0 w-full flex items-center gap-2 px-3 py-2 rounded-2xl transition-all hover:bg-surface-tint whitespace-nowrap"
              activeProps={{ className: "bg-background" }}
            >
              <doc.Icon size={16} weight="thin" />
              <span>{doc.title}</span>
            </Link>
          ) : (
            <Link
              key={doc.slug}
              to="/docs/$slug"
              params={{ slug: doc.slug }}
              className="shrink-0 w-full flex items-center gap-2 px-3 py-2 rounded-2xl transition-all hover:bg-surface-tint whitespace-nowrap"
              activeProps={{ className: "bg-background" }}
            >
              <doc.Icon size={16} weight="thin" />
              <span>{doc.title}</span>
            </Link>
          ),
        )}
      </section>
      <div className="flex-1 min-w-0 overflow-auto p-2 pl-4">
        <Outlet />
      </div>
    </div>
  );
}
