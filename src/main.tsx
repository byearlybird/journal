import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App.tsx";
import { StoreProvider } from "./store";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
	| string
	| undefined;

if (!PUBLISHABLE_KEY) {
	throw new Error("Add your Clerk Publishable Key to the .env file");
}

// biome-ignore lint/style/noNonNullAssertion: we know the element is always present
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
			<StoreProvider>
				<App />
			</StoreProvider>
		</ClerkProvider>
	</StrictMode>,
);
