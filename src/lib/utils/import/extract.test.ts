import { expect, test } from "bun:test";
import type { AnyObject, StarlingDocument } from "@byearlybird/starling";
import type { Comment, Note, Task } from "@/lib/db";
import {
	extractAttributes,
	extractComments,
	extractNotes,
	extractTasks,
} from "./extract";

// Helper to create a ResourceObject for testing
function makeResource<T extends AnyObject>(id: string, attributes: T) {
	return {
		id,
		attributes,
		meta: {
			eventstamps: {},
			latest: "2025-01-01T00:00:00.000Z|0000|0000",
			deletedAt: null as string | null,
		},
	};
}

// Helper to create a StarlingDocument for testing
function makeDocument<T extends AnyObject>(
	type: string,
	resources: Record<string, ReturnType<typeof makeResource<AnyObject>>>,
): StarlingDocument<T> {
	return {
		type,
		latest: "2025-01-01T00:00:00.000Z|0000|0000",
		resources: resources as StarlingDocument<T>["resources"],
	};
}

test("extractAttributes - extracts from StarlingDocument format", () => {
	const doc = makeDocument("test", {
		id1: makeResource("id1", { content: "Test 1" }),
		id2: makeResource("id2", { content: "Test 2" }),
	});

	const attrs = extractAttributes(doc);
	expect(attrs).toHaveLength(2);
	expect(attrs.some((a) => a.content === "Test 1")).toBe(true);
	expect(attrs.some((a) => a.content === "Test 2")).toBe(true);
});

test("extractAttributes - filters out deleted resources", () => {
	const deletedResource = makeResource("id1", { content: "Deleted" });
	deletedResource.meta.deletedAt = "2025-01-01T00:00:00.000Z|0001|0000";

	const doc = makeDocument("test", {
		id1: deletedResource,
		id2: makeResource("id2", { content: "Active" }),
	});

	const attrs = extractAttributes(doc);
	expect(attrs).toHaveLength(1);
	expect(attrs[0]?.content).toBe("Active");
});

test("extractAttributes - returns empty array for undefined", () => {
	const attrs = extractAttributes(undefined);
	expect(attrs).toEqual([]);
});

test("extractAttributes - returns empty array for empty resources", () => {
	const doc = makeDocument("test", {});
	const attrs = extractAttributes(doc);
	expect(attrs).toEqual([]);
});

test("extractNotes - validates and extracts valid notes", () => {
	const id = crypto.randomUUID();
	const data = {
		notes: makeDocument<Note>("notes", {
			[id]: makeResource(id, {
				id,
				content: "Valid note",
				createdAt: new Date().toISOString(),
			}),
		}),
	};

	const result = extractNotes(data);
	expect(result.valid).toHaveLength(1);
	expect(result.valid[0]?.content).toBe("Valid note");
	expect(result.errors).toBe(0);
});

test("extractNotes - supports legacy 'entries' key for backward compatibility", () => {
	const id = crypto.randomUUID();
	const data = {
		entries: makeDocument<Note>("entries", {
			[id]: makeResource(id, {
				id,
				content: "Legacy entry",
				createdAt: new Date().toISOString(),
			}),
		}),
	};

	const result = extractNotes(data);
	expect(result.valid).toHaveLength(1);
	expect(result.valid[0]?.content).toBe("Legacy entry");
	expect(result.errors).toBe(0);
});

test("extractNotes - handles invalid notes", () => {
	const id1 = crypto.randomUUID();
	const id2 = crypto.randomUUID();
	const data = {
		notes: makeDocument<Note>("notes", {
			[id1]: makeResource(id1, {
				id: id1,
				content: "Valid note",
				createdAt: new Date().toISOString(),
			}),
			[id2]: makeResource(id2, {
				invalid: "data",
			}),
		}),
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
	const id = crypto.randomUUID();
	const data = {
		tasks: makeDocument<Task>("tasks", {
			[id]: makeResource(id, {
				id,
				content: "Valid task",
				status: "incomplete" as const,
				createdAt: new Date().toISOString(),
			}),
		}),
	};

	const result = extractTasks(data);
	expect(result.valid).toHaveLength(1);
	expect(result.valid[0]?.content).toBe("Valid task");
	expect(result.valid[0]?.status).toBe("incomplete");
	expect(result.errors).toBe(0);
});

test("extractTasks - handles invalid tasks", () => {
	const id1 = crypto.randomUUID();
	const id2 = crypto.randomUUID();
	const data = {
		tasks: makeDocument<Task>("tasks", {
			[id1]: makeResource(id1, {
				id: id1,
				content: "Valid task",
				status: "complete" as const,
				createdAt: new Date().toISOString(),
			}),
			[id2]: makeResource(id2, {
				invalid: "data",
			}),
		}),
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
	const commentId = crypto.randomUUID();
	const data = {
		comments: makeDocument<Comment>("comments", {
			[commentId]: makeResource(commentId, {
				id: commentId,
				entryId,
				content: "Valid comment",
				createdAt: new Date().toISOString(),
			}),
		}),
	};

	const result = extractComments(data);
	expect(result.valid).toHaveLength(1);
	expect(result.valid[0]?.content).toBe("Valid comment");
	expect(result.valid[0]?.entryId).toBe(entryId);
	expect(result.errors).toBe(0);
});

test("extractComments - handles invalid comments", () => {
	const entryId = crypto.randomUUID();
	const id1 = crypto.randomUUID();
	const id2 = crypto.randomUUID();
	const data = {
		comments: makeDocument<Comment>("comments", {
			[id1]: makeResource(id1, {
				id: id1,
				entryId,
				content: "Valid comment",
				createdAt: new Date().toISOString(),
			}),
			[id2]: makeResource(id2, {
				invalid: "data",
			}),
		}),
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
