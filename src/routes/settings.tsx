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
    <div className="flex flex-col sm:flex-row flex-1 size-full overflow-hidden">
      <section className="flex flex-row sm:flex-col justify-between sm:justify-start shrink-0 sm:min-w-50 gap-2 sm:gap-0 sm:space-y-2 overflow-x-auto sm:overflow-x-visible border-b sm:border-b-0 sm:border-r border-border p-2 sm:pt-2 sm:pr-4 sm:px-2">
        {navItems.map(({ label, ...item }) => (
          <Link
            key={item.to}
            {...item}
            className="shrink-0 sm:w-full px-3 py-2 rounded-2xl transition-all hover:bg-foreground/5 whitespace-nowrap"
            activeProps={{ className: "bg-background" }}
          >
            {label}
          </Link>
        ))}
        <div className="shrink-0 sm:mt-auto sm:pt-2 sm:border-t sm:border-dashed sm:border-border">
          <Show when="signed-out">
            <SignInButton>
              <button className="shrink-0 sm:w-full px-3 py-2 rounded-2xl transition-all hover:bg-foreground/5 text-left whitespace-nowrap">
                Sign in
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <div className="px-3 py-2 flex items-center gap-2 whitespace-nowrap">
              <UserButton />
              <span className="hidden sm:inline text-sm">Account</span>
            </div>
          </Show>
        </div>
      </section>
      <div className="flex-1 min-w-0 overflow-auto p-2 sm:pl-4">
        <Outlet />
      </div>
    </div>
  );
}
