import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/tokens.css";
import "./global.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
	| string
	| undefined;

if (!PUBLISHABLE_KEY) {
	throw new Error("Add your Clerk Publishable Key to the .env file");
}

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
			<App />
		</ClerkProvider>
	</StrictMode>,
);
