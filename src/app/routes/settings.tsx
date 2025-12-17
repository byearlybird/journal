import {
	ArrowsClockwise,
	DownloadIcon,
	SignInIcon,
	SignOutIcon,
	UploadIcon,
} from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Page } from "@/components/layout";
import { Button, Drawer, Input } from "@/components/ui";
import { useExportData, useImportData, useSyncData } from "@/features/data";
import { useAuth } from "@/lib/auth/context";
import { formatDateTime } from "@/lib/utils/dates/format";

const SettingsPage = () => {
	const [isSignInDrawerOpen, setIsSignInDrawerOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSigningIn, setIsSigningIn] = useState(false);
	const [signInError, setSignInError] = useState<string | null>(null);
	const [isSyncing, setIsSyncing] = useState(false);
	const { isAuthenticated, user, signIn, signOut, lastSyncedAt, updateLastSyncedAt } = useAuth();
	const handleExport = useExportData();
	const importData = useImportData();
	const { sync, canSync } = useSyncData();

	useEffect(() => {
		if (!isSignInDrawerOpen) {
			// Reset state when drawer closes
			setEmail("");
			setPassword("");
			setSignInError(null);
		}
	}, [isSignInDrawerOpen]);

	const handleImport = async () => {
		const result = await importData();

		if (!result) {
			// User cancelled file selection
			return;
		}

		if (result.success) {
			if (result.imported > 0) {
				alert(
					`Successfully imported ${result.imported} items${result.errors > 0 ? ` (${result.errors} errors)` : ""}`,
				);
			} else if (result.errors > 0) {
				alert(`Import failed: ${result.errors} errors`);
			} else {
				alert("No valid data found to import");
			}
		} else {
			alert(`Failed to import data: ${result.error}`);
		}
	};

	const handleSignInSubmit = async () => {
		if (!email || !password) return;

		setIsSigningIn(true);
		setSignInError(null);

		try {
			await signIn({ email, password });
			setIsSignInDrawerOpen(false);
		} catch (error) {
			setSignInError(
				error instanceof Error ? error.message : "Failed to sign in",
			);
		} finally {
			setIsSigningIn(false);
		}
	};

	const handleSignOut = async () => {
		try {
			await signOut();
		} catch (error) {
			alert(error instanceof Error ? error.message : "Failed to sign out");
		}
	};

	const handleSync = async () => {
		if (!canSync) return;

		setIsSyncing(true);
		try {
			await sync();
			updateLastSyncedAt();
		} catch (error) {
			alert(
				error instanceof Error ? error.message : "Failed to sync data",
			);
		} finally {
			setIsSyncing(false);
		}
	};

	return (
		<Page className="flex flex-col gap-4">
			<div className="rounded-xl bg-white/8 p-2 flex flex-col divide-y">
				{isAuthenticated ? (
					<button
						type="button"
						className="p-2 flex items-center gap-3"
						onClick={handleSignOut}
					>
						<SignOutIcon className="size-4" />
						Sign out ({user?.email})
					</button>
				) : (
					<button
						type="button"
						className="p-2 flex items-center gap-3"
						onClick={() => {
							setIsSignInDrawerOpen(true);
						}}
					>
						<SignInIcon className="size-4" />
						Sign in to sync data
					</button>
				)}
			</div>
			{isAuthenticated && (
				<div className="rounded-xl bg-white/8 p-2 flex flex-col divide-y">
					<button
						type="button"
						className="p-2 flex items-center gap-3"
						onClick={handleSync}
						disabled={isSyncing || !canSync}
					>
						<ArrowsClockwise className="size-4" />
						{isSyncing ? "Syncing..." : "Sync"}
					</button>
					{lastSyncedAt && (
						<div className="p-2 text-sm text-white/60">
							Last synced: {formatDateTime(lastSyncedAt)}
						</div>
					)}
					{!lastSyncedAt && (
						<div className="p-2 text-sm text-white/60">
							Last synced: Never
						</div>
					)}
				</div>
			)}
			<div className="rounded-xl bg-white/8 p-2 flex flex-col divide-y">
				<button
					type="button"
					className="p-2 flex items-center gap-3"
					onClick={handleExport}
				>
					<DownloadIcon className="size-4" />
					Export data
				</button>
				<button
					type="button"
					className="p-2 flex items-center gap-3"
					onClick={handleImport}
				>
					<UploadIcon className="size-4" />
					Import data
				</button>
			</div>
			<Drawer.Root
				open={isSignInDrawerOpen}
				onOpenChange={setIsSignInDrawerOpen}
			>
				<Drawer.Content>
					<Drawer.Body>
						<div className="flex flex-col gap-4">
							<Input
								type="email"
								placeholder="Email"
								value={email}
								onChange={(e) => setEmail(e.currentTarget.value)}
								disabled={isSigningIn}
							/>
							<Input
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.currentTarget.value)}
								disabled={isSigningIn}
							/>
							{signInError && (
								<div className="text-red-400 text-sm">{signInError}</div>
							)}
							<Button
								variant="solid-yellow"
								disabled={!email || !password || isSigningIn}
								onClick={handleSignInSubmit}
							>
								{isSigningIn ? "Signing in..." : "Sign in"}
							</Button>
						</div>
					</Drawer.Body>
				</Drawer.Content>
			</Drawer.Root>
		</Page>
	);
};

export const Route = createFileRoute("/settings")({
	component: SettingsPage,
});
