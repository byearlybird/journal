import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/task/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/task/$id"!</div>;
}
