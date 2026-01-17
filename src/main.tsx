import { ENV } from "@app/env";
import { Root } from "@app/routes/_root";
import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorComponent, Loading } from "./components";
import { AppProvider } from "./providers";
import "./main.css";

// biome-ignore lint/style/noNonNullAssertion: we know the element is always present
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}>
      <AppProvider loadingComponent={<AppLoading />} errorComponent={<AppError />}>
        <Root />
      </AppProvider>
    </ClerkProvider>
  </StrictMode>,
);

function AppLoading() {
  return (
    <main className="flex size-full h-screen items-center justify-center">
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
