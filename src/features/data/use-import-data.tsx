import { db } from "@/lib/db";
import { pickJsonFile } from "@/lib/utils/file-picker";
import {
	extractComments,
	extractEntries,
	parseImportJson,
	validateImportStructure,
} from "@/lib/utils/import";

/**
 * Result of an import operation
 */
export type ImportResult =
	| { success: true; imported: number; errors: number }
	| { success: false; error: string };

/**
 * Hook for importing journal data from JSON file
 * Handles file selection, parsing, validation, and database operations
 *
 * @returns Function to trigger import workflow that returns a promise with the result
 *
 * @example
 * const importData = useImportData();
 *
 * const handleImport = async () => {
 *   const result = await importData();
 *   if (result?.success) {
 *     alert(`Imported ${result.imported} items`);
 *   }
 * };
 */
export function useImportData(): () => Promise<ImportResult | null> {
	return async () => {
		const file = await pickJsonFile();
		if (!file) {
			return null;
		}

		try {
			// Read and parse file
			const text = await file.text();
			const data = parseImportJson(text);

			// Validate structure
			if (!validateImportStructure(data)) {
				return { success: false, error: "Invalid data format" };
			}

			// Extract and validate entries and comments
			const entriesResult = extractEntries(data);
			const commentsResult = extractComments(data);

			// Add valid entries to database
			for (const entry of entriesResult.valid) {
				db.entries.add(entry);
			}

			// Add valid comments to database
			for (const comment of commentsResult.valid) {
				db.comments.add(comment);
			}

			// Calculate totals
			const totalImported =
				entriesResult.valid.length + commentsResult.valid.length;
			const totalErrors = entriesResult.errors + commentsResult.errors;

			return {
				success: true,
				imported: totalImported,
				errors: totalErrors,
			};
		} catch (err) {
			console.error("Import error:", err);
			return {
				success: false,
				error: err instanceof Error ? err.message : "Invalid JSON file",
			};
		}
	};
}
