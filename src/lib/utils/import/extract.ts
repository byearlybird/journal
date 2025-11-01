import type { Comment, Entry } from "@/lib/db";
import { CommentSchema, EntrySchema } from "@/lib/db";
import type { ImportData } from "./parse";
import { validateItem } from "./validate";

/**
 * Extracts attributes array from Starling document format
 * @param document - The Starling document with JSON:API format
 * @returns Array of attributes, or empty array if document is undefined
 */
export function extractAttributes<T>(
	document: { data: Array<{ attributes: T }> } | undefined,
): T[] {
	if (!document?.data) {
		return [];
	}

	return document.data.map((item) => item.attributes);
}

/**
 * Extracts and validates entries from import data
 * @param data - The import data containing entries
 * @returns Object with valid entries array and error count
 */
export function extractEntries(data: ImportData): {
	valid: Entry[];
	errors: number;
} {
	const attributes = extractAttributes(data.entries);
	const results = attributes.map((item) => validateItem(item, EntrySchema));

	// Isolate side effect - log validation errors
	for (const result of results) {
		if (!result.success) {
			console.error("Failed to validate entry:", result.error);
		}
	}

	return {
		valid: results.filter((r) => r.success).map((r) => r.data),
		errors: results.filter((r) => !r.success).length,
	};
}

/**
 * Extracts and validates comments from import data
 * @param data - The import data containing comments
 * @returns Object with valid comments array and error count
 */
export function extractComments(data: ImportData): {
	valid: Comment[];
	errors: number;
} {
	const attributes = extractAttributes(data.comments);
	const results = attributes.map((item) => validateItem(item, CommentSchema));

	// Isolate side effect - log validation errors
	for (const result of results) {
		if (!result.success) {
			console.error("Failed to validate comment:", result.error);
		}
	}

	return {
		valid: results.filter((r) => r.success).map((r) => r.data),
		errors: results.filter((r) => !r.success).length,
	};
}
