import type { StarlingDocument } from "@byearlybird/starling";
import type { Comment, Note, Task } from "@/lib/db";

/**
 * Type representing export data from Starling ORM's toDocuments() method
 */
export type ImportData = {
	notes?: StarlingDocument<Note>;
	tasks?: StarlingDocument<Task>;
	comments?: StarlingDocument<Comment>;
	// Backward compatibility with legacy exports that used 'entries' instead of 'notes'
	entries?: StarlingDocument<Note>;
};

/**
 * Parses JSON string into ImportData structure
 * @param jsonString - The JSON string to parse
 * @returns Parsed ImportData object
 * @throws {Error} If JSON is invalid
 */
export function parseImportJson(jsonString: string): ImportData {
	try {
		return JSON.parse(jsonString) as ImportData;
	} catch (error) {
		throw new Error(
			`Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
		);
	}
}

/**
 * Validates that a collection has the expected StarlingDocument structure
 */
function isValidCollection(value: unknown): boolean {
	if (value === undefined) return true;
	if (typeof value !== "object" || value === null) return false;
	const obj = value as Record<string, unknown>;
	return (
		typeof obj.type === "string" &&
		typeof obj.latest === "string" &&
		typeof obj.resources === "object" &&
		obj.resources !== null
	);
}

/**
 * Validates that the parsed data has the expected StarlingDocument structure
 * @param data - The data to validate
 * @returns True if data matches ImportData structure
 */
export function validateImportStructure(data: unknown): data is ImportData {
	if (!data || typeof data !== "object") {
		return false;
	}

	const obj = data as Record<string, unknown>;

	return (
		isValidCollection(obj.notes) &&
		isValidCollection(obj.tasks) &&
		isValidCollection(obj.comments) &&
		isValidCollection(obj.entries)
	);
}
