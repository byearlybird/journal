import type { AnyObject, StarlingDocument } from "@byearlybird/starling";
import type { Comment, Note, Task } from "@/lib/db";
import { commentSchema, noteSchema, taskSchema } from "@/lib/db";
import type { ImportData } from "./parse";
import { validateItem } from "./validate";

/**
 * Extracts attributes array from Starling document format
 * Filters out soft-deleted resources (where deletedAt is not null)
 * @param document - The StarlingDocument with resources
 * @returns Array of attributes, or empty array if document is undefined
 */
export function extractAttributes<T extends AnyObject>(
	document: StarlingDocument<T> | undefined,
): T[] {
	if (!document?.resources) {
		return [];
	}

	return Object.values(document.resources)
		.filter((resource) => resource.meta.deletedAt === null)
		.map((resource) => resource.attributes);
}

/**
 * Extracts and validates notes from import data
 * Supports both 'notes' key and legacy 'entries' key for backward compatibility
 * @param data - The import data containing notes
 * @returns Object with valid notes array and error count
 */
export function extractNotes(data: ImportData): {
	valid: Note[];
	errors: number;
} {
	// Support both 'notes' and legacy 'entries' key
	const attributes = extractAttributes(data.notes ?? data.entries);
	const results = attributes.map((item) => validateItem(item, noteSchema));

	// Isolate side effect - log validation errors
	for (const result of results) {
		if (!result.success) {
			console.error("Failed to validate note:", result.error);
		}
	}

	return {
		valid: results.filter((r) => r.success).map((r) => r.data),
		errors: results.filter((r) => !r.success).length,
	};
}

/**
 * Extracts and validates tasks from import data
 * @param data - The import data containing tasks
 * @returns Object with valid tasks array and error count
 */
export function extractTasks(data: ImportData): {
	valid: Task[];
	errors: number;
} {
	const attributes = extractAttributes(data.tasks);
	const results = attributes.map((item) => validateItem(item, taskSchema));

	// Isolate side effect - log validation errors
	for (const result of results) {
		if (!result.success) {
			console.error("Failed to validate task:", result.error);
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
	const results = attributes.map((item) => validateItem(item, commentSchema));

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
