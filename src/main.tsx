import { ENV } from "@app/env";
import { ClerkProvider } from "@clerk/clerk-react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorComponent, Loading } from "./components";
import { DatabaseProvider } from "./db";
import { routeTree } from "./routeTree.gen";
import "./main.css";

// Create router instance
const router = createRouter({ routeTree });

// TypeScript: Register router type
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// biome-ignore lint/style/noNonNullAssertion: we know the element is always present
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY} standardBrowser={false}>
      <DatabaseProvider loadingComponent={<AppLoading />} errorComponent={<AppError />}>
        <RouterProvider router={router} />
      </DatabaseProvider>
    </ClerkProvider>
  </StrictMode>,
);

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
