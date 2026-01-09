import { CreateDialog } from "@app/components/create-dialog";
import { Navbar } from "@app/components/navbar";
import { Sidebar } from "@app/components/sidebar";
import { useCryptoKeyInit } from "@app/store/crypto-key";
import { useSync } from "@app/store/sync";
import { createRootRoute, Outlet } from "@tanstack/react-router";

export const rootRoute = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	useSync();
	useCryptoKeyInit();

	return (
		<div className="grid h-screen grid-cols-5">
			<div className="hidden w-full md:block">
				<Sidebar />
			</div>
			<div className="col-span-5 max-h-screen overflow-y-auto md:col-span-4">
				<Outlet />
			</div>
			<div className="md:hidden">
				<Navbar />
			</div>
			<CreateDialog />
		</div>
	);
}
