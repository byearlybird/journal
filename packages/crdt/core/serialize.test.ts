import { expect, test } from "bun:test";
import { objectFromState, objectToState } from "./serialize";

test("objectToState converts simple object to state", () => {
	const object = { name: "John", age: 30 };
	const getEventstamp = () => "2023-01-01T00:00:00Z";

	const state = objectToState(object, getEventstamp);

	expect(state).toHaveLength(2);
	expect(state).toContainEqual({
		path: "name",
		value: "John",
		eventstamp: "2023-01-01T00:00:00Z",
	});
	expect(state).toContainEqual({
		path: "age",
		value: 30,
		eventstamp: "2023-01-01T00:00:00Z",
	});
});

test("objectToState handles nested objects", () => {
	const object = {
		user: {
			profile: {
				name: "Alice",
				settings: { theme: "dark" },
			},
		},
	};
	const getEventstamp = () => "timestamp";

	const state = objectToState(object, getEventstamp);

	expect(state).toContainEqual({
		path: "user.profile.name",
		value: "Alice",
		eventstamp: "timestamp",
	});
	expect(state).toContainEqual({
		path: "user.profile.settings.theme",
		value: "dark",
		eventstamp: "timestamp",
	});
});

test("objectToState handles arrays", () => {
	const object = {
		tags: ["javascript", "typescript"],
		matrix: [
			[1, 2],
			[3, 4],
		],
	};
	const getEventstamp = () => "ts";

	const state = objectToState(object, getEventstamp);

	expect(state).toContainEqual({
		path: "tags.0",
		value: "javascript",
		eventstamp: "ts",
	});
	expect(state).toContainEqual({
		path: "tags.1",
		value: "typescript",
		eventstamp: "ts",
	});
	expect(state).toContainEqual({
		path: "matrix.0.0",
		value: 1,
		eventstamp: "ts",
	});
	expect(state).toContainEqual({
		path: "matrix.1.1",
		value: 4,
		eventstamp: "ts",
	});
});

test("objectToState handles null and boolean values", () => {
	const object = {
		active: true,
		deleted: false,
		description: null,
	};
	const getEventstamp = () => "test";

	const state = objectToState(object, getEventstamp);

	expect(state).toContainEqual({
		path: "active",
		value: true,
		eventstamp: "test",
	});
	expect(state).toContainEqual({
		path: "deleted",
		value: false,
		eventstamp: "test",
	});
	expect(state).toContainEqual({
		path: "description",
		value: null,
		eventstamp: "test",
	});
});

test("objectToState handles empty object", () => {
	const object = {};
	const getEventstamp = () => "empty";

	const state = objectToState(object, getEventstamp);

	expect(state).toHaveLength(0);
});

test("objectFromState reconstructs simple object", () => {
	const state = [
		{ path: "name", value: "Bob", eventstamp: "ts1" },
		{ path: "age", value: 25, eventstamp: "ts2" },
	];

	const object = objectFromState(state);

	expect(object).toEqual({ name: "Bob", age: 25 });
});

test("objectFromState reconstructs nested objects", () => {
	const state = [
		{ path: "user.profile.name", value: "Charlie", eventstamp: "ts1" },
		{
			path: "user.profile.email",
			value: "charlie@example.com",
			eventstamp: "ts2",
		},
		{ path: "user.settings.theme", value: "light", eventstamp: "ts3" },
	];

	const object = objectFromState(state);

	expect(object).toEqual({
		user: {
			profile: {
				name: "Charlie",
				email: "charlie@example.com",
			},
			settings: {
				theme: "light",
			},
		},
	});
});

test("objectFromState reconstructs arrays", () => {
	const state = [
		{ path: "items.0", value: "first", eventstamp: "ts1" },
		{ path: "items.1", value: "second", eventstamp: "ts2" },
		{ path: "matrix.0.0", value: 10, eventstamp: "ts3" },
		{ path: "matrix.0.1", value: 20, eventstamp: "ts4" },
	];

	const object = objectFromState(state);

	expect(object).toEqual({
		items: ["first", "second"],
		matrix: [[10, 20]],
	});
});

test("objectFromState handles mixed data types", () => {
	const state = [
		{ path: "id", value: 123, eventstamp: "ts1" },
		{ path: "active", value: true, eventstamp: "ts2" },
		{ path: "name", value: "test", eventstamp: "ts3" },
		{ path: "metadata", value: null, eventstamp: "ts4" },
	];

	const object = objectFromState(state);

	expect(object).toEqual({
		id: 123,
		active: true,
		name: "test",
		metadata: null,
	});
});

test("objectFromState handles empty state", () => {
	const state = [];

	const object = objectFromState(state);

	expect(object).toEqual({});
});

test("round-trip conversion preserves data", () => {
	const original = {
		user: {
			id: 42,
			profile: {
				name: "Diana",
				preferences: {
					theme: "auto",
					notifications: true,
				},
			},
			tags: ["developer", "designer"],
		},
		metadata: {
			created: "2023-01-01",
			updated: null,
		},
	};
	const getEventstamp = () => "round-trip-test";

	const state = objectToState(original, getEventstamp);
	const reconstructed = objectFromState(state);

	expect(reconstructed).toEqual(original);
});

test("round-trip with partial object", () => {
	const partial = {
		name: "Eve",
		settings: {
			theme: "dark",
		},
	};
	const getEventstamp = () => "partial-test";

	const state = objectToState(partial, getEventstamp);
	const reconstructed = objectFromState(state);

	expect(reconstructed).toEqual(partial);
});
