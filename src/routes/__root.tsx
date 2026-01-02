import { ClerkProvider } from "@clerk/clerk-react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { StoreProvider } from "../store";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as
	| string
	| undefined;

if (!PUBLISHABLE_KEY) {
	throw new Error("Add your Clerk Publishable Key to the .env file");
}

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	return (
		<ClerkProvider publishableKey={PUBLISHABLE_KEY}>
			<StoreProvider>
				<Outlet />
			</StoreProvider>
		</ClerkProvider>
	);
}

