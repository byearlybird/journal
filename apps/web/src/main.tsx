import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ConnectionsProvider } from "./components/Connections.tsx";
import { RepoProvider } from "./components/StoreContext.tsx";

// biome-ignore lint/style/noNonNullAssertion: <root setup>
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ConnectionsProvider>
			<RepoProvider>
				<App />
			</RepoProvider>
		</ConnectionsProvider>
	</StrictMode>,
);
