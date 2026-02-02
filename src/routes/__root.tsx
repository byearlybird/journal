import { ENV } from "@app/env";
import { ErrorComponent, Loading } from "@app/components";
import { ClerkProvider } from "@clerk/clerk-react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { migrator } from "@app/db";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: AppError,
  pendingComponent: AppLoading,
  loader: () => {
    return migrator.migrateToLatest();
  },
});

function RootComponent() {
  return (
    <ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY} standardBrowser={false}>
      <QueryClientProvider client={queryClient}>
        <Outlet />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function NotFoundComponent() {
  return <div className="mx-auto max-w-2xl p-4 text-white">404 - Page not found</div>;
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

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
});
