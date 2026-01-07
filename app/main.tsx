import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import { ENV } from "@app/env";
import { Root } from "@app/routes/_root";
import { ClerkProvider } from "@clerk/clerk-react";
import { DbProvider } from "./db/db-provider";

// biome-ignore lint/style/noNonNullAssertion: we know the element is always present
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ClerkProvider publishableKey={ENV.VITE_CLERK_PUBLISHABLE_KEY}>
			<DbProvider loading={<div>Loading...</div>}>
				<Root />
			</DbProvider>
		</ClerkProvider>
	</StrictMode>,
);
