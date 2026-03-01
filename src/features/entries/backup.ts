import { dumpDatabase, mergeIntoDatabase } from "@/db/sync-utils";

export async function exportBackup() {
  const dump = await dumpDatabase();
  const json = JSON.stringify(dump, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const now = new Date();
  const datetime = now.toISOString().slice(0, 19).replaceAll(":", "-");

  const a = document.createElement("a");
  a.href = url;
  a.download = `notebook-backup-${datetime}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importBackup() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      await mergeIntoDatabase(parsed);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Import failed.");
    }
  });

  input.click();
}
