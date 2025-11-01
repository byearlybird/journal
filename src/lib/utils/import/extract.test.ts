import { expect, test } from "bun:test";
import { extractAttributes, extractComments, extractEntries } from "./extract";

test("extractAttributes - extracts from JSON:API format", () => {
	const doc = {
		data: [
			{ attributes: { content: "Test 1" } },
			{ attributes: { content: "Test 2" } },
		],
	};

	const attrs = extractAttributes(doc);
	expect(attrs).toHaveLength(2);
	expect(attrs[0]?.content).toBe("Test 1");
	expect(attrs[1]?.content).toBe("Test 2");
});

test("extractAttributes - returns empty array for undefined", () => {
	const attrs = extractAttributes(undefined);
	expect(attrs).toEqual([]);
});

test("extractAttributes - returns empty array for empty data", () => {
	const doc = { data: [] };
	const attrs = extractAttributes(doc);
	expect(attrs).toEqual([]);
});

test("extractEntries - validates and extracts valid entries", () => {
	const data = {
		entries: {
			data: [
				{
					attributes: {
						id: crypto.randomUUID(),
						content: "Valid entry",
						createdAt: new Date().toISOString(),
					},
				},
			],
		},
	};

	const result = extractEntries(data);
	expect(result.valid).toHaveLength(1);
	expect(result.valid[0]?.content).toBe("Valid entry");
	expect(result.errors).toBe(0);
});

test("extractEntries - handles invalid entries", () => {
	const data = {
		entries: {
			data: [
				{
					attributes: {
						id: crypto.randomUUID(),
						content: "Valid entry",
						createdAt: new Date().toISOString(),
					},
				},
				{
					attributes: {
						invalid: "data",
					},
				},
			],
		},
	};

	const result = extractEntries(data);
	expect(result.valid).toHaveLength(1);
	expect(result.errors).toBe(1);
});

test("extractEntries - returns empty when no entries", () => {
	const data = {};
	const result = extractEntries(data);
	expect(result.valid).toEqual([]);
	expect(result.errors).toBe(0);
});

test("extractComments - validates and extracts valid comments", () => {
	const entryId = crypto.randomUUID();
	const data = {
		comments: {
			data: [
				{
					attributes: {
						id: crypto.randomUUID(),
						entryId,
						content: "Valid comment",
						createdAt: new Date().toISOString(),
					},
				},
			],
		},
	};

	const result = extractComments(data);
	expect(result.valid).toHaveLength(1);
	expect(result.valid[0]?.content).toBe("Valid comment");
	expect(result.valid[0]?.entryId).toBe(entryId);
	expect(result.errors).toBe(0);
});

test("extractComments - handles invalid comments", () => {
	const entryId = crypto.randomUUID();
	const data = {
		comments: {
			data: [
				{
					attributes: {
						id: crypto.randomUUID(),
						entryId,
						content: "Valid comment",
						createdAt: new Date().toISOString(),
					},
				},
				{
					attributes: {
						invalid: "data",
					},
				},
			],
		},
	};

	const result = extractComments(data);
	expect(result.valid).toHaveLength(1);
	expect(result.errors).toBe(1);
});

test("extractComments - returns empty when no comments", () => {
	const data = {};
	const result = extractComments(data);
	expect(result.valid).toEqual([]);
	expect(result.errors).toBe(0);
});
