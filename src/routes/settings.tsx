import { useState } from "react";
import { SignedIn, SignedOut, SignInButton, SignOutButton, useUser } from "@clerk/clerk-react";
import {
  CaretLeftIcon,
  DownloadSimpleIcon,
  ExportIcon,
  SignInIcon,
  SignOutIcon,
} from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import { ExportDialog } from "@app/features/entries/export-dialog";
import { ImportDialog } from "@app/features/entries/import-dialog";
import { useSyncContext } from "@app/features/sync";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate({ to: "/app", viewTransition: { types: ["slide-right"] } });
  };

  return (
    <div className="flex min-h-screen flex-col space-y-4 max-w-2xl mx-auto pt-safe-top pb-safe-bottom">
      <header className="flex items-center gap-2 px-4 py-2">
        <button
          type="button"
          onClick={goBack}
          className="flex size-10 shrink-0 items-center justify-center rounded-md transition-transform active:scale-105"
          aria-label="Go back"
        >
          <CaretLeftIcon className="size-6" />
        </button>
        <div className="flex-1 text-center">
          <span className="font-medium">Settings</span>
        </div>
        <div className="size-10 shrink-0" />
      </header>
      <AccountSection />
      <BackupSection />
    </div>
  );
}

function BackupSection() {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const { lastSyncedAt } = useSyncContext();

  return (
    <section className="px-4 pt-4 space-y-1">
      <h2 className="font-medium px-2">Backups</h2>
      <div className="flex flex-col divide-y items-center rounded-lg border border-slate-light bg-slate-medium">
        <div className="flex items-center justify-between w-full p-4">
          <span>Cloud backup</span>
          <SignedOut>
            <span className="text-cloud-medium">Sign in to enable</span>
          </SignedOut>
          <SignedIn>
            <span className="text-cloud-medium text-xs">
              {lastSyncedAt ? formatDistanceToNow(lastSyncedAt, { addSuffix: true }) : "Never"}
            </span>
          </SignedIn>
        </div>
        <button
          type="button"
          onClick={() => setIsExportDialogOpen(true)}
          className="flex items-center justify-between w-full p-4 transition-transform active:scale-[0.99]"
        >
          <span>Export data</span>
          <ExportIcon className="size-5 text-cloud-medium" />
        </button>
        <button
          type="button"
          onClick={() => setIsImportDialogOpen(true)}
          className="flex items-center justify-between w-full p-4 transition-transform active:scale-[0.99]"
        >
          <span>Import data</span>
          <DownloadSimpleIcon className="size-5 text-cloud-medium" />
        </button>
      </div>
      <ExportDialog open={isExportDialogOpen} onClose={() => setIsExportDialogOpen(false)} />
      <ImportDialog open={isImportDialogOpen} onClose={() => setIsImportDialogOpen(false)} />
    </section>
  );
}

function AccountSection() {
  return (
    <section className="px-4 pt-4 space-y-1">
      <h2 className="font-medium px-2">Account</h2>
      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl={"/settings"}>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-md border border-slate-light bg-slate-medium p-4 text-ivory-dark transition-transform active:scale-[0.99]"
          >
            <span>Sign in</span>
            <SignInIcon className="size-5" />
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <AccountCard />
      </SignedIn>
    </section>
  );
}

function AccountCard() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-light bg-slate-medium p-4">
      <span className="text-ivory-dark truncate">{user?.primaryEmailAddress?.emailAddress}</span>
      <SignOutButton>
        <button
          type="button"
          className="flex shrink-0 items-center gap-2 text-ivory-dark transition-transform active:scale-[0.99]"
        >
          <SignOutIcon className="size-5" />
          <span>Sign out</span>
        </button>
      </SignOutButton>
    </div>
  );
}
