import { ENV } from "@app/env";
import { ErrorComponent, Loading } from "@app/components";
import { ClerkProvider } from "@clerk/clerk-react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { dbService } from "@app/db";
import { migrations } from "@app/db/migrations";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: AppError,
  pendingComponent: AppLoading,
  beforeLoad: () => {
    dbService.init(migrations);
  },
});

function RootComponent() {
  return (
    <ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY} standardBrowser={false}>
      <main className="[view-transition-name:main-content]">
        <Outlet />
      </main>
    </ClerkProvider>
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

function AppError() {
  return (
    <main className="flex size-full h-screen items-center justify-center">
      <ErrorComponent />
    </main>
  );
}
