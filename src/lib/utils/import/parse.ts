/**
 * Type representing the JSON:API format from Starling ORM export
 */
export type ImportData = {
	notes?: { data: Array<{ attributes: unknown }> };
	tasks?: { data: Array<{ attributes: unknown }> };
	comments?: { data: Array<{ attributes: unknown }> };
	// Backward compatibility with legacy exports
	entries?: { data: Array<{ attributes: unknown }> };
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
 * Validates that a collection has the expected JSON:API structure
 */
function isValidCollection(value: unknown): boolean {
	if (value === undefined) return true;
	if (typeof value !== "object" || value === null) return false;
	if (!("data" in value)) return false;
	return Array.isArray((value as Record<string, unknown>).data);
}

/**
 * Validates that the parsed data has the expected JSON:API structure
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
