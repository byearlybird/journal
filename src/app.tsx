import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { ErrorComponent, Loading } from "@app/components";
import { migrator } from "@app/db";
import { SyncProvider } from "@app/features/sync";
import { $router } from "@app/stores/router";
import { AppLayout } from "@app/pages/app-layout";
import { TodayPage } from "@app/pages/today-page";
import { EntriesPage } from "@app/pages/entries-page";
import { NotePage } from "@app/pages/note-page";
import { TaskPage } from "@app/pages/task-page";
import { SettingsPage } from "@app/pages/settings-page";
import { NotFoundPage } from "@app/pages/not-found-page";

export function App() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    migrator
      .migrateToLatest()
      .then(() => setStatus("ready"))
      .catch((err) => {
        console.error(err);
        setStatus("error");
      });
  }, []);

  if (status === "loading") {
    return (
      <main className="flex h-screen items-center justify-center">
        <Loading />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex size-full h-screen items-center justify-center">
        <ErrorComponent />
      </main>
    );
  }

  return (
    <SyncProvider>
      <main className="[view-transition-name:main-content]">
        <RouterSwitch />
      </main>
    </SyncProvider>
  );
}

function RouterSwitch() {
  const page = useStore($router);

  useEffect(() => {
    if (!page && window.location.pathname === "/") {
      $router.open("/app");
    }
  }, [page]);

  if (!page) {
    if (window.location.pathname === "/") return null;
    return <NotFoundPage />;
  }

  switch (page.route) {
    case "app":
      return (
        <AppLayout>
          <TodayPage />
        </AppLayout>
      );
    case "entries":
      return (
        <AppLayout>
          <EntriesPage />
        </AppLayout>
      );
    case "note":
      return <NotePage id={page.params.id} />;
    case "task":
      return <TaskPage id={page.params.id} />;
    case "settings":
      return <SettingsPage />;
    default:
      return <NotFoundPage />;
  }
}
