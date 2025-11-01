import { expect, test } from "bun:test";
import { parseImportJson, validateImportStructure } from "./parse";

test("parseImportJson - valid JSON with entries", () => {
	const json = '{"entries":{"data":[]}}';
	const result = parseImportJson(json);
	expect(result).toEqual({ entries: { data: [] } });
});

test("parseImportJson - valid JSON with comments", () => {
	const json = '{"comments":{"data":[]}}';
	const result = parseImportJson(json);
	expect(result).toEqual({ comments: { data: [] } });
});

test("parseImportJson - valid JSON with both entries and comments", () => {
	const json = '{"entries":{"data":[]},"comments":{"data":[]}}';
	const result = parseImportJson(json);
	expect(result).toEqual({ entries: { data: [] }, comments: { data: [] } });
});

test("parseImportJson - invalid JSON throws error", () => {
	expect(() => parseImportJson("not json")).toThrow();
	expect(() => parseImportJson("{invalid}")).toThrow();
	expect(() => parseImportJson("")).toThrow();
});

test("validateImportStructure - valid structure with entries", () => {
	const data = { entries: { data: [] } };
	expect(validateImportStructure(data)).toBe(true);
});

test("validateImportStructure - valid structure with comments", () => {
	const data = { comments: { data: [] } };
	expect(validateImportStructure(data)).toBe(true);
});

test("validateImportStructure - valid structure with both", () => {
	const data = { entries: { data: [] }, comments: { data: [] } };
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

test("validateImportStructure - invalid: entries without data array", () => {
	expect(validateImportStructure({ entries: {} })).toBe(false);
	expect(validateImportStructure({ entries: { data: "not array" } })).toBe(
		false,
	);
	expect(validateImportStructure({ entries: null })).toBe(false);
});

test("validateImportStructure - invalid: comments without data array", () => {
	expect(validateImportStructure({ comments: {} })).toBe(false);
	expect(validateImportStructure({ comments: { data: "not array" } })).toBe(
		false,
	);
	expect(validateImportStructure({ comments: null })).toBe(false);
});
