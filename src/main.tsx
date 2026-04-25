import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ClerkProvider, useAuth } from "@clerk/react";
import { routeTree } from "./routeTree.gen";
import { $userSettings, type Theme } from "./stores/user-settings";
import "./index.css";

const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

const THEME_COLOR_DARK = "#262626";
const THEME_COLOR_LIGHT = "#e5e5e5";
const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

const resolveTheme = (theme: Theme): "dark" | "light" =>
  theme === "system" ? (systemDark.matches ? "dark" : "light") : theme;

const applyAccent = (accent: string) => {
  document.documentElement.dataset.accent = accent;
};
const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = resolveTheme(theme);
};
const applyThemeColor = (theme: Theme) => {
  if (!themeColorMeta) return;
  themeColorMeta.content = resolveTheme(theme) === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
};

applyAccent($userSettings.get().accent);
applyTheme($userSettings.get().theme);
applyThemeColor($userSettings.get().theme);

$userSettings.subscribe((settings) => {
  applyAccent(settings.accent);
  applyTheme(settings.theme);
  applyThemeColor(settings.theme);
});

systemDark.addEventListener("change", () => {
  if ($userSettings.get().theme === "system") {
    applyTheme("system");
    applyThemeColor("system");
  }
});

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log("[auth] env vars baked into bundle:", import.meta.env);
console.log(
  "[auth] publishable key:",
  PUBLISHABLE_KEY ?? "(undefined — was VITE_CLERK_PUBLISHABLE_KEY set at build time?)",
);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function AuthDebug() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  useEffect(() => {
    console.log("[auth] state:", { isLoaded, isSignedIn, userId });
  }, [isLoaded, isSignedIn, userId]);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
      signUpForceRedirectUrl="/settings/sync"
      signInForceRedirectUrl="/settings/sync"
    >
      <AuthDebug />
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
);
