import { useState } from "react";
import { Button } from "@/components/common/button";
import { DialogContent, DialogRoot, DialogTitle } from "@/components/common/dialog";
import { Textarea } from "@/components/common/textarea";
import { mergeIntoDatabase } from "@/db/dump";
import { useRouter } from "@tanstack/react-router";

export function ImportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [json, setJson] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const handleClose = () => {
    setJson("");
    setError(null);
    onClose();
  };

  const handleImport = async () => {
    setError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setError("Invalid JSON. Please check the format and try again.");
      return;
    }

    setImporting(true);
    try {
      await mergeIntoDatabase(parsed as Parameters<typeof mergeIntoDatabase>[0]);
      await router.invalidate();
      handleClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogTitle>Import Database</DialogTitle>
        <Textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          placeholder="Paste exported JSON here…"
        />
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={handleClose} variant="slate">
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            variant="gold"
            type="button"
            disabled={importing || !json.trim()}
          >
            {importing ? "Importing…" : "Import"}
          </Button>
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
