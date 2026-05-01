import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { docs } from "@/lib/docs";

export const Route = createFileRoute("/docs")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col sm:flex-row flex-1 size-full overflow-hidden">
      <section className="flex flex-row sm:flex-col shrink-0 sm:min-w-50 gap-2 sm:gap-0 sm:space-y-2 overflow-x-auto sm:overflow-x-visible border-b sm:border-b-0 sm:border-r border-border p-2 sm:pt-2 sm:pr-4 sm:px-2">
        {docs.map((doc, i) =>
          i === 0 ? (
            <Link
              key={doc.slug}
              to="/docs"
              activeOptions={{ exact: true }}
              className="shrink-0 sm:w-full flex items-center gap-2 px-3 py-2 rounded-2xl transition-all hover:bg-surface-tint whitespace-nowrap"
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
              className="shrink-0 sm:w-full flex items-center gap-2 px-3 py-2 rounded-2xl transition-all hover:bg-surface-tint whitespace-nowrap"
              activeProps={{ className: "bg-background" }}
            >
              <doc.Icon size={16} weight="thin" />
              <span>{doc.title}</span>
            </Link>
          ),
        )}
      </section>
      <div className="flex-1 min-w-0 overflow-auto p-2 sm:pl-4">
        <Outlet />
      </div>
    </div>
  );
}
