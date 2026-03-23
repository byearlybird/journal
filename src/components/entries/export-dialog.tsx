import { useEffect, useState } from "react";
import { Button } from "@/components/common/button";
import { DialogContent, DialogRoot, DialogTitle } from "@/components/common/dialog";
import { dumpDatabase, type DatabaseDump } from "@/db/dump";

export function ExportDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [dump, setDump] = useState<DatabaseDump | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setDump(null);
      setCopied(false);
      return;
    }

    setLoading(true);
    dumpDatabase()
      .then(setDump)
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <DialogRoot open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Export Database</DialogTitle>
        {loading ? (
          <p className="py-8 text-center text-sm text-cloud-medium">Exporting…</p>
        ) : (
          <pre className="flex-1 overflow-auto rounded-md bg-slate-dark p-3 text-xs text-cloud-light">
            {JSON.stringify(dump, null, 2)}
          </pre>
        )}
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={onClose} variant="slate">
            Close
          </Button>
          {!loading && (
            <Button
              variant="gold"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(dump, null, 2));
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
