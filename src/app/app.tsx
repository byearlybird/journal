import { Router } from "@solidjs/router";
import { routes } from "./routes";
import "./styles.css";
import { ErrorBoundary } from "solid-js";
import { Navigation } from "@/components/layout/navigation";
import { useKeyboardHeight } from "@/lib/primitives";
import { DbProvider } from "./providers/db-provider";

export const App = () => {
	useKeyboardHeight();

	return (
		<ErrorBoundary fallback={<h1>Oops!</h1>}>
			<DbProvider>
				<Router root={Navigation}>{routes}</Router>
			</DbProvider>
		</ErrorBoundary>
	);
};
