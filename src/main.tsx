import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { App } from "./app";
import "./main.css";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk Publishable Key to the .env file");
}

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
      <App />
    </ClerkProvider>
  </StrictMode>,
);
