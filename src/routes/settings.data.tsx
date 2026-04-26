import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/button";
import { dataService } from "@/services/data-service";

export const Route = createFileRoute("/settings/data")({
  component: RouteComponent,
});

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function RouteComponent() {
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    if (busy) return;
    setBusy(true);
    try {
      const data = await dataService.buildExport();
      const stamp = new Date().toISOString().slice(0, 10);
      downloadJson(`journal-export-${stamp}.json`, data);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8 max-w-sm">
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-foreground">Export data</h2>
          <p className="text-sm text-foreground-muted mt-1">
            Download a JSON file containing your notes, tasks, and intentions.
          </p>
        </div>
        <Button onClick={handleExport} disabled={busy}>
          {busy ? "Preparing…" : "Export"}
        </Button>
      </div>
    </div>
  );
}
