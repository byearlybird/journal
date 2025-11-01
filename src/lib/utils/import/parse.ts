/**
 * Type representing the JSON:API format from Starling ORM export
 */
export type ImportData = {
	entries?: { data: Array<{ attributes: unknown }> };
	comments?: { data: Array<{ attributes: unknown }> };
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
 * Validates that the parsed data has the expected JSON:API structure
 * @param data - The data to validate
 * @returns True if data matches ImportData structure
 */
export function validateImportStructure(data: unknown): data is ImportData {
	if (!data || typeof data !== "object") {
		return false;
	}

	const obj = data as Record<string, unknown>;

	// Check if entries exists and has correct structure
	if (obj.entries !== undefined) {
		if (
			typeof obj.entries !== "object" ||
			obj.entries === null ||
			!("data" in obj.entries) ||
			!Array.isArray((obj.entries as Record<string, unknown>).data)
		) {
			return false;
		}
	}

	// Check if comments exists and has correct structure
	if (obj.comments !== undefined) {
		if (
			typeof obj.comments !== "object" ||
			obj.comments === null ||
			!("data" in obj.comments) ||
			!Array.isArray((obj.comments as Record<string, unknown>).data)
		) {
			return false;
		}
	}

	return true;
}
