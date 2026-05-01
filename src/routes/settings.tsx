import { createFileRoute, Link, linkOptions, Outlet } from "@tanstack/react-router";
import { Show, SignInButton, UserButton } from "@clerk/react";

const navItems = linkOptions([
  { to: "/settings", label: "Labels", activeOptions: { exact: true } },
  { to: "/settings/theme", label: "Theme" },
  { to: "/settings/sync", label: "Sync" },
  { to: "/settings/data", label: "Data" },
]);

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col md:flex-row flex-1 size-full overflow-hidden">
      <section className="flex flex-row md:flex-col justify-between md:justify-start shrink-0 md:min-w-50 gap-2 md:gap-0 md:space-y-2 overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-r border-border p-2 md:pt-2 md:pr-4 md:px-2">
        {navItems.map(({ label, ...item }) => (
          <Link
            key={item.to}
            {...item}
            className="shrink-0 md:w-full px-3 py-2 rounded-2xl transition-all hover:bg-surface-tint whitespace-nowrap"
            activeProps={{ className: "bg-background" }}
          >
            {label}
          </Link>
        ))}
        <div className="shrink-0 md:mt-auto md:pt-2 md:border-t md:border-dashed md:border-border">
          <Show when="signed-out">
            <SignInButton>
              <button className="shrink-0 md:w-full px-3 py-2 rounded-2xl transition-all hover:bg-surface-tint text-left whitespace-nowrap">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <div className="px-3 py-2 flex items-center gap-2 whitespace-nowrap">
              <UserButton />
              <span className="hidden md:inline text-sm">Account</span>
            </div>
          </Show>
        </div>
      </section>
      <div className="flex-1 min-w-0 overflow-auto p-2 md:pl-4">
        <Outlet />
      </div>
    </div>
  );
}
