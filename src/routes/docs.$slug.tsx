import { createFileRoute } from "@tanstack/react-router";
import { DocMarkdown } from "@/components/markdown";
import { getDoc } from "@/lib/docs";

export const Route = createFileRoute("/docs/$slug")({
  component: RouteComponent,
});

function RouteComponent() {
  const { slug } = Route.useParams();
  const doc = getDoc(slug);

  if (!doc) {
    return <p className="p-8 opacity-50">Doc not found.</p>;
  }

  return (
    <div className="max-w-prose p-8">
      <DocMarkdown content={doc.content} />
    </div>
  );
}
