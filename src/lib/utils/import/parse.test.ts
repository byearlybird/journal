import { expect, test } from "bun:test";
import { parseImportJson, validateImportStructure } from "./parse";

test("parseImportJson - valid JSON with notes", () => {
	const json =
		'{"notes":{"type":"notes","latest":"2025-01-01","resources":{}}}';
	const result = parseImportJson(json);
	expect(result.notes?.type).toBe("notes");
	expect(result.notes?.latest).toBe("2025-01-01");
	expect(result.notes?.resources).toEqual({});
});

test("parseImportJson - valid JSON with comments", () => {
	const json =
		'{"comments":{"type":"comments","latest":"2025-01-01","resources":{}}}';
	const result = parseImportJson(json);
	expect(result.comments?.type).toBe("comments");
	expect(result.comments?.latest).toBe("2025-01-01");
	expect(result.comments?.resources).toEqual({});
});

test("parseImportJson - valid JSON with both notes and comments", () => {
	const json =
		'{"notes":{"type":"notes","latest":"2025-01-01","resources":{}},"comments":{"type":"comments","latest":"2025-01-01","resources":{}}}';
	const result = parseImportJson(json);
	expect(result.notes?.type).toBe("notes");
	expect(result.comments?.type).toBe("comments");
});

test("parseImportJson - invalid JSON throws error", () => {
	expect(() => parseImportJson("not json")).toThrow();
	expect(() => parseImportJson("{invalid}")).toThrow();
	expect(() => parseImportJson("")).toThrow();
});

test("validateImportStructure - valid structure with notes", () => {
	const data = {
		notes: { type: "notes", latest: "2025-01-01", resources: {} },
	};
	expect(validateImportStructure(data)).toBe(true);
});

test("validateImportStructure - valid structure with comments", () => {
	const data = {
		comments: { type: "comments", latest: "2025-01-01", resources: {} },
	};
	expect(validateImportStructure(data)).toBe(true);
});

test("validateImportStructure - valid structure with both", () => {
	const data = {
		notes: { type: "notes", latest: "2025-01-01", resources: {} },
		comments: { type: "comments", latest: "2025-01-01", resources: {} },
	};
	expect(validateImportStructure(data)).toBe(true);
});

test("validateImportStructure - empty object is valid", () => {
	const data = {};
	expect(validateImportStructure(data)).toBe(true);
});

test("validateImportStructure - invalid: null", () => {
	expect(validateImportStructure(null)).toBe(false);
});

test("validateImportStructure - invalid: non-object", () => {
	expect(validateImportStructure("string")).toBe(false);
	expect(validateImportStructure(123)).toBe(false);
	expect(validateImportStructure([])).toBe(false);
});

test("validateImportStructure - invalid: notes without required fields", () => {
	expect(validateImportStructure({ notes: {} })).toBe(false);
	expect(validateImportStructure({ notes: { type: "notes" } })).toBe(false);
	expect(
		validateImportStructure({ notes: { type: "notes", latest: "2025-01-01" } }),
	).toBe(false);
	expect(validateImportStructure({ notes: null })).toBe(false);
});

test("validateImportStructure - invalid: comments without required fields", () => {
	expect(validateImportStructure({ comments: {} })).toBe(false);
	expect(validateImportStructure({ comments: { type: "comments" } })).toBe(
		false,
	);
	expect(
		validateImportStructure({
			comments: { type: "comments", latest: "2025-01-01" },
		}),
	).toBe(false);
	expect(validateImportStructure({ comments: null })).toBe(false);
});
