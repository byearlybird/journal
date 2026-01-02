import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { ClerkProvider } from "@clerk/clerk-react";
import { store } from "../lib/store";
import { initPersistence } from "../lib/store/persistence";
import App from "./index.tsx";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
	| string
	| undefined;

if (!PUBLISHABLE_KEY) {
	throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Initialize persistence
const persistence = initPersistence(store);

// Export the promise to await initialization
export const storeReady = persistence.ready;

export { persistence };

// Await store initialization before rendering
await storeReady;

// biome-ignore lint/style/noNonNullAssertion: we know the element is always present
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
			<App />
		</ClerkProvider>
	</StrictMode>,
);
