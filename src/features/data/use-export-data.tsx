import { db } from "@/lib/db";
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
	return () => {
		const docs = db.toDocuments();
		downloadJson(docs, "journal-data.json");
	};
}
