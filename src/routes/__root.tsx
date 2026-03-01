import { ErrorComponent, Loading } from "@app/components";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { migrator } from "@app/db";
import { SyncProvider } from "@app/features/sync";

let migrated = false;

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: AppError,
  pendingComponent: AppLoading,
  beforeLoad: async () => {
    if (!migrated) {
      await migrator.migrateToLatest();
      migrated = true;
    }
  },
});

function RootComponent() {
  return (
    <SyncProvider>
      <main className="[view-transition-name:main-content]">
        <Outlet />
      </main>
    </SyncProvider>
  );
}

function NotFoundComponent() {
  return <div className="mx-auto max-w-2xl p-4 text-ivory-light">404 - Page not found</div>;
}

function AppLoading() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Loading />
    </main>
  );
}

function AppError(props: { error: Error }) {
  console.error(props.error.message);
  return (
    <main className="flex size-full h-screen items-center justify-center">
      <ErrorComponent />
    </main>
  );
}
