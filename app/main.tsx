import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { ENV } from "@app/env";
import { Root } from "@app/routes/_root";
import { load } from "@app/store/persistence";
import { ClerkProvider } from "@clerk/clerk-react";

// Initialize store from IDB
await load();

// biome-ignore lint/style/noNonNullAssertion: we know the element is always present
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}>
			<Root />
		</ClerkProvider>
	</StrictMode>,
);
