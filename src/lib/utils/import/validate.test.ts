import { expect, test } from "bun:test";
import { z } from "zod";
import { validateItem } from "./validate";

const TestSchema = z.object({
	id: z.string(),
	value: z.number(),
});

test("validateItem - valid item returns success", () => {
	const item = { id: "test", value: 42 };
	const result = validateItem(item, TestSchema);

	expect(result.success).toBe(true);
	if (result.success) {
		expect(result.data).toEqual({ id: "test", value: 42 });
	}
});

test("validateItem - invalid item returns error", () => {
	const item = { id: "test", value: "not a number" };
	const result = validateItem(item, TestSchema);

	expect(result.success).toBe(false);
	if (!result.success) {
		expect(result.error).toBeInstanceOf(Error);
	}
});

test("validateItem - missing required field returns error", () => {
	const item = { id: "test" };
	const result = validateItem(item, TestSchema);

	expect(result.success).toBe(false);
});

test("validateItem - extra fields are allowed by default", () => {
	const item = { id: "test", value: 42, extra: "field" };
	const result = validateItem(item, TestSchema);

	expect(result.success).toBe(true);
});

test("validateItem - null returns error", () => {
	const result = validateItem(null, TestSchema);
	expect(result.success).toBe(false);
});

test("validateItem - undefined returns error", () => {
	const result = validateItem(undefined, TestSchema);
	expect(result.success).toBe(false);
});
