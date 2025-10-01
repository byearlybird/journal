import type { ZodSchema } from "zod";

/**
 * Result of validating a single item against a schema
 */
export type ValidationResult<T> =
	| { success: true; data: T }
	| { success: false; error: Error };

/**
 * Validates a single item against a Zod schema
 * @param item - The item to validate
 * @param schema - The Zod schema to validate against
 * @returns Validation result with either data or error
 */
export function validateItem<T>(
	item: unknown,
	schema: ZodSchema<T>,
): ValidationResult<T> {
	try {
		const data = schema.parse(item);
		return { success: true, data };
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error ? error : new Error("Unknown validation error"),
		};
	}
}
