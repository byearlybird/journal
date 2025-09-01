import { test, expect } from "bun:test";
import { mergeField, mergeState } from "./merge";
import type { Field, State } from "./types";

test("mergeField adds new field to empty state", () => {
	const state: State = [];
	const field: Field = {
		path: "name",
		value: "Alice",
		eventstamp: "2023-01-01T00:00:00Z",
	};

	const [newState, modified] = mergeField(state, field);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(1);
	expect(newState).toContain(field);
});

test("mergeField adds new field to existing state", () => {
	const state: State = [
		{ path: "age", value: 30, eventstamp: "2023-01-01T00:00:00Z" },
	];
	const field: Field = {
		path: "name",
		value: "Bob",
		eventstamp: "2023-01-02T00:00:00Z",
	};

	const [newState, modified] = mergeField(state, field);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(2);
	expect(newState).toContain(field);
	expect(newState).toContain(state[0]);
});

test("mergeField replaces field with newer eventstamp", () => {
	const state: State = [
		{ path: "name", value: "Charlie", eventstamp: "2023-01-01T00:00:00Z" },
	];
	const newerField: Field = {
		path: "name",
		value: "David",
		eventstamp: "2023-01-02T00:00:00Z",
	};

	const [newState, modified] = mergeField(state, newerField);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(1);
	expect(newState[0]).toEqual(newerField);
});

test("mergeField ignores field with older eventstamp", () => {
	const currentField: Field = {
		path: "name",
		value: "Eve",
		eventstamp: "2023-01-02T00:00:00Z",
	};
	const state: State = [currentField];
	const olderField: Field = {
		path: "name",
		value: "Frank",
		eventstamp: "2023-01-01T00:00:00Z",
	};

	const [newState, modified] = mergeField(state, olderField);

	expect(modified).toBe(false);
	expect(newState).toBe(state);
	expect(newState[0]).toEqual(currentField);
});

test("mergeField handles equal eventstamps by replacing", () => {
	const state: State = [
		{ path: "status", value: "draft", eventstamp: "2023-01-01T12:00:00Z" },
	];
	const sameTimestampField: Field = {
		path: "status",
		value: "published",
		eventstamp: "2023-01-01T12:00:00Z",
	};

	const [newState, modified] = mergeField(state, sameTimestampField);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(1);
	expect(newState[0]).toEqual(sameTimestampField);
});

test("mergeField preserves other fields when replacing", () => {
	const state: State = [
		{ path: "id", value: 123, eventstamp: "2023-01-01T00:00:00Z" },
		{ path: "name", value: "Grace", eventstamp: "2023-01-01T00:00:00Z" },
		{ path: "email", value: "grace@example.com", eventstamp: "2023-01-01T00:00:00Z" },
	];
	const updatedField: Field = {
		path: "name",
		value: "Grace Updated",
		eventstamp: "2023-01-02T00:00:00Z",
	};

	const [newState, modified] = mergeField(state, updatedField);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(3);
	expect(newState.find(f => f.path === "id")).toEqual(state[0]);
	expect(newState.find(f => f.path === "email")).toEqual(state[2]);
	expect(newState.find(f => f.path === "name")).toEqual(updatedField);
});

test("mergeState merges empty states", () => {
	const state1: State = [];
	const state2: State = [];

	const [newState, modified] = mergeState(state1, state2);

	expect(modified).toBe(false);
	expect(newState).toEqual([]);
});

test("mergeState merges state with empty state", () => {
	const state1: State = [
		{ path: "name", value: "Henry", eventstamp: "2023-01-01T00:00:00Z" },
	];
	const state2: State = [];

	const [newState, modified] = mergeState(state1, state2);

	expect(modified).toBe(false);
	expect(newState).toEqual(state1);
});

test("mergeState merges empty state with state", () => {
	const state1: State = [];
	const state2: State = [
		{ path: "age", value: 28, eventstamp: "2023-01-01T00:00:00Z" },
	];

	const [newState, modified] = mergeState(state1, state2);

	expect(modified).toBe(true);
	expect(newState).toEqual(state2);
});

test("mergeState merges non-overlapping fields", () => {
	const state1: State = [
		{ path: "name", value: "Ian", eventstamp: "2023-01-01T00:00:00Z" },
	];
	const state2: State = [
		{ path: "age", value: 32, eventstamp: "2023-01-01T00:00:00Z" },
		{ path: "email", value: "ian@example.com", eventstamp: "2023-01-01T00:00:00Z" },
	];

	const [newState, modified] = mergeState(state1, state2);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(3);
	expect(newState).toContainEqual(state1[0]);
	expect(newState).toContainEqual(state2[0]);
	expect(newState).toContainEqual(state2[1]);
});

test("mergeState handles conflicting fields with newer eventstamps", () => {
	const state1: State = [
		{ path: "name", value: "Jane", eventstamp: "2023-01-01T00:00:00Z" },
		{ path: "status", value: "active", eventstamp: "2023-01-01T00:00:00Z" },
	];
	const state2: State = [
		{ path: "name", value: "Jane Updated", eventstamp: "2023-01-02T00:00:00Z" },
		{ path: "email", value: "jane@example.com", eventstamp: "2023-01-01T00:00:00Z" },
	];

	const [newState, modified] = mergeState(state1, state2);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(3);
	expect(newState.find(f => f.path === "name")).toEqual(state2[0]);
	expect(newState.find(f => f.path === "status")).toEqual(state1[1]);
	expect(newState.find(f => f.path === "email")).toEqual(state2[1]);
});

test("mergeState handles conflicting fields with older eventstamps", () => {
	const state1: State = [
		{ path: "title", value: "Current Title", eventstamp: "2023-01-02T00:00:00Z" },
	];
	const state2: State = [
		{ path: "title", value: "Old Title", eventstamp: "2023-01-01T00:00:00Z" },
		{ path: "content", value: "New content", eventstamp: "2023-01-02T00:00:00Z" },
	];

	const [newState, modified] = mergeState(state1, state2);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(2);
	expect(newState.find(f => f.path === "title")).toEqual(state1[0]);
	expect(newState.find(f => f.path === "content")).toEqual(state2[1]);
});

test("mergeState reports no modification when all fields are older", () => {
	const state1: State = [
		{ path: "name", value: "Kevin", eventstamp: "2023-01-02T00:00:00Z" },
		{ path: "age", value: 35, eventstamp: "2023-01-02T00:00:00Z" },
	];
	const state2: State = [
		{ path: "name", value: "Kevin Old", eventstamp: "2023-01-01T00:00:00Z" },
		{ path: "age", value: 34, eventstamp: "2023-01-01T00:00:00Z" },
	];

	const [newState, modified] = mergeState(state1, state2);

	expect(modified).toBe(false);
	expect(newState).toEqual(state1);
});

test("mergeState handles mixed scenarios", () => {
	const state1: State = [
		{ path: "id", value: 1, eventstamp: "2023-01-01T00:00:00Z" },
		{ path: "name", value: "Laura", eventstamp: "2023-01-01T00:00:00Z" },
		{ path: "status", value: "draft", eventstamp: "2023-01-02T00:00:00Z" },
	];
	const state2: State = [
		{ path: "name", value: "Laura Updated", eventstamp: "2023-01-02T00:00:00Z" },
		{ path: "status", value: "published", eventstamp: "2023-01-01T00:00:00Z" },
		{ path: "tags", value: ["new", "important"], eventstamp: "2023-01-01T00:00:00Z" },
	];

	const [newState, modified] = mergeState(state1, state2);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(4);
	expect(newState.find(f => f.path === "id")).toEqual(state1[0]);
	expect(newState.find(f => f.path === "name")).toEqual(state2[0]);
	expect(newState.find(f => f.path === "status")).toEqual(state1[2]);
	expect(newState.find(f => f.path === "tags")).toEqual(state2[2]);
});

test("mergeState with complex eventstamp comparisons", () => {
	const state1: State = [
		{ path: "field1", value: "a", eventstamp: "2023-01-01T12:00:00Z" },
		{ path: "field2", value: "b", eventstamp: "2023-01-01T13:00:00Z" },
	];
	const state2: State = [
		{ path: "field1", value: "updated_a", eventstamp: "2023-01-01T12:30:00Z" },
		{ path: "field2", value: "updated_b", eventstamp: "2023-01-01T11:00:00Z" },
		{ path: "field3", value: "c", eventstamp: "2023-01-01T14:00:00Z" },
	];

	const [newState, modified] = mergeState(state1, state2);

	expect(modified).toBe(true);
	expect(newState).toHaveLength(3);
	expect(newState.find(f => f.path === "field1")?.value).toBe("updated_a");
	expect(newState.find(f => f.path === "field2")?.value).toBe("b");
	expect(newState.find(f => f.path === "field3")?.value).toBe("c");
});