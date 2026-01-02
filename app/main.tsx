import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { store } from "@app/store";
import { ClerkProvider } from "@clerk/clerk-react";
import { getSnapshot } from "./persistence";
import { Root } from "./routes/_root";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
	| string
	| undefined;

if (!PUBLISHABLE_KEY) {
	throw new Error("Add your Clerk Publishable Key to the .env file");
}

// Initialize store from IDB
await getSnapshot().then((snapshot) => {
	if (snapshot) {
		store.merge(snapshot);
	}
});

// biome-ignore lint/style/noNonNullAssertion: we know the element is always present
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
			<Root />
		</ClerkProvider>
	</StrictMode>,
);
