import { useDatabase } from "@/lib/db/context";
import { pickJsonFile } from "@/lib/utils/file-picker";
import {
	extractComments,
	extractNotes,
	extractTasks,
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
	const db = useDatabase();

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

			// Extract and validate notes, tasks, and comments
			const notesResult = extractNotes(data);
			const tasksResult = extractTasks(data);
			const commentsResult = extractComments(data);

			// Add valid notes to database
			for (const note of notesResult.valid) {
				db.notes.add(note);
			}

			// Add valid tasks to database
			for (const task of tasksResult.valid) {
				db.tasks.add(task);
			}

			// Add valid comments to database
			for (const comment of commentsResult.valid) {
				db.comments.add(comment);
			}

			// Calculate totals
			const totalImported =
				notesResult.valid.length +
				tasksResult.valid.length +
				commentsResult.valid.length;
			const totalErrors =
				notesResult.errors + tasksResult.errors + commentsResult.errors;

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
