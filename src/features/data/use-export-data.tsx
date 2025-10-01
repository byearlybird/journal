import { useDatabase } from "@/lib/db/context";
import { downloadJson } from "@/lib/utils/download";

/**
 * Hook for exporting journal data to JSON file
 * Creates a downloadable JSON file with all entries and comments
 *
 * @returns Function to trigger export workflow
 *
 * @example
 * const handleExport = useExportData();
 *
 * // Later, when user clicks export button:
 * <button onClick={handleExport}>Export data</button>
 */
export function useExportData(): () => void {
	const db = useDatabase();

	return () => {
		const docs = db.toDocuments();
		const timestamp = new Date().toISOString().replace(/:/g, "_");
		downloadJson(docs, `journal-export-${timestamp}.json`);
	};
}
