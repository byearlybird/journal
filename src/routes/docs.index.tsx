import { createFileRoute } from "@tanstack/react-router";
import { DocMarkdown } from "@/components/markdown";
import { docs } from "@/lib/docs";

export const Route = createFileRoute("/docs/")({
  component: RouteComponent,
});

function RouteComponent() {
  const doc = docs[0];
  return (
    <div className="max-w-prose p-8">
      <DocMarkdown content={doc.content} />
    </div>
  );
}
