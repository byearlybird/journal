import { Outlet, createRootRoute } from "@tanstack/solid-router";
import { ErrorBoundary } from "solid-js";
import { Navigation } from "@/components/layout/navigation";
import { useKeyboardHeight } from "@/lib/primitives";
import { DbProvider } from "@/app/providers/db-provider";
import "@/app/app.css";

const RootComponent = () => {
        useKeyboardHeight();

        return (
                <ErrorBoundary fallback={<h1>Oops!</h1>}>
                        <DbProvider>
                                <Navigation>
                                        <Outlet />
                                </Navigation>
                        </DbProvider>
                </ErrorBoundary>
        );
};

export const Route = createRootRoute({
        component: RootComponent,
});
