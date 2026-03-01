import { useStore } from "@nanostores/react";
import { useEffect, useState } from "react";
import { ErrorComponent, Loading } from "@/components";
import { getDb } from "@/db";
import { SyncProvider } from "@/features/sync";
import { $router } from "@/stores/router";
import { AppLayout } from "@/pages/app-layout";
import { TodayPage } from "@/pages/today-page";
import { EntriesPage } from "@/pages/entries-page";
import { NotePage } from "@/pages/note-page";
import { TaskPage } from "@/pages/task-page";
import { SettingsPage } from "@/pages/settings-page";
import { NotFoundPage } from "@/pages/not-found-page";

export function App() {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    getDb()
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
