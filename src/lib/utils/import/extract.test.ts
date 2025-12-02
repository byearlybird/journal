import { expect, test } from "bun:test";
import {
	extractAttributes,
	extractComments,
	extractNotes,
	extractTasks,
} from "./extract";

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

test("extractNotes - validates and extracts valid notes", () => {
	const data = {
		notes: {
			data: [
				{
					attributes: {
						id: crypto.randomUUID(),
						content: "Valid note",
						createdAt: new Date().toISOString(),
					},
				},
			],
		},
	};

	const result = extractNotes(data);
	expect(result.valid).toHaveLength(1);
	expect(result.valid[0]?.content).toBe("Valid note");
	expect(result.errors).toBe(0);
});

test("extractNotes - supports legacy 'entries' key for backward compatibility", () => {
	const data = {
		entries: {
			data: [
				{
					attributes: {
						id: crypto.randomUUID(),
						content: "Legacy entry",
						createdAt: new Date().toISOString(),
					},
				},
			],
		},
	};

	const result = extractNotes(data);
	expect(result.valid).toHaveLength(1);
	expect(result.valid[0]?.content).toBe("Legacy entry");
	expect(result.errors).toBe(0);
});

test("extractNotes - handles invalid notes", () => {
	const data = {
		notes: {
			data: [
				{
					attributes: {
						id: crypto.randomUUID(),
						content: "Valid note",
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

	const result = extractNotes(data);
	expect(result.valid).toHaveLength(1);
	expect(result.errors).toBe(1);
});

test("extractNotes - returns empty when no notes", () => {
	const data = {};
	const result = extractNotes(data);
	expect(result.valid).toEqual([]);
	expect(result.errors).toBe(0);
});

test("extractTasks - validates and extracts valid tasks", () => {
	const data = {
		tasks: {
			data: [
				{
					attributes: {
						id: crypto.randomUUID(),
						content: "Valid task",
						status: "incomplete",
						createdAt: new Date().toISOString(),
					},
				},
			],
		},
	};

	const result = extractTasks(data);
	expect(result.valid).toHaveLength(1);
	expect(result.valid[0]?.content).toBe("Valid task");
	expect(result.valid[0]?.status).toBe("incomplete");
	expect(result.errors).toBe(0);
});

test("extractTasks - handles invalid tasks", () => {
	const data = {
		tasks: {
			data: [
				{
					attributes: {
						id: crypto.randomUUID(),
						content: "Valid task",
						status: "complete",
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

	const result = extractTasks(data);
	expect(result.valid).toHaveLength(1);
	expect(result.errors).toBe(1);
});

test("extractTasks - returns empty when no tasks", () => {
	const data = {};
	const result = extractTasks(data);
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
