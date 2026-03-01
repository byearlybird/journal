import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import { SplashScreen } from "@capacitor/splash-screen";
import { Keyboard } from "@capacitor/keyboard";
import { ClerkProvider } from "@clerk/clerk-react";
import "./main.css";
import { SyncProvider } from "./features/sync";

// Create router instance
const router = createRouter({ routeTree, defaultViewTransition: true });

// TypeScript: Register router type
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Hide the splash (per Capacitor docs, you should do this on app launch)
await SplashScreen.hide();

// Show the splash for an indefinite amount of time:
await SplashScreen.show({
  autoHide: false,
});

await Keyboard.setAccessoryBarVisible({
  isVisible: false,
});

console.log(PUBLISHABLE_KEY);

// biome-ignore lint/style/noNonNullAssertion: we know the element is always present
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorBackground: "#262625",
          colorInputBackground: "#191919",
          colorInputText: "#e5e4df",
          colorText: "#e5e4df",
          colorTextSecondary: "#91918d",
          colorPrimary: "#fada5e",
          colorDanger: "#e54d43",
          colorNeutral: "#e5e4df",
          borderRadius: "8px",
          fontFamily: '"Karla", sans-serif',
        },
        elements: {
          modalContent: "pt-safe-top",
          card: "shadow-none",
          formButtonPrimary: { color: "#191919" },
          footerAction: "bg-transparent",
          footer: "[&>*]:bg-transparent",
        },
      }}
    >
      <SyncProvider>
        <RouterProvider router={router} />
      </SyncProvider>
    </ClerkProvider>
  </StrictMode>,
);
