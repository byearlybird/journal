import { describe, expect, it } from "bun:test";
import { none, some } from "./option";

describe("Option utilities", () => {
	describe("some", () => {
		it("creates Some object with correct tag and value", () => {
			const result = some("test value");
			expect(result).toEqual({
				tag: "some",
				value: "test value",
			});
		});

		it("works with different value types", () => {
			const numberResult = some(42);
			const objectResult = some({
				key: "value",
			});

			expect(numberResult.tag).toBe("some");
			expect(numberResult.value).toBe(42);
			expect(objectResult.tag).toBe("some");
			expect(objectResult.value).toEqual({
				key: "value",
			});
		});
	});

	describe("none", () => {
		it("creates None object with correct tag", () => {
			const result = none();
			expect(result).toEqual({
				tag: "none",
			});
		});
	});

	describe("type discrimination", () => {
		it("can discriminate between some and none using tag", () => {
			const someResult = some("value");
			const noneResult = none();

			if (someResult.tag === "some") {
				expect(someResult.value).toBe("value");
			}

			if (noneResult.tag === "none") {
				expect(noneResult.tag).toBe("none");
			}
		});
	});

	describe("edge cases", () => {
		it("handles null and undefined values in some", () => {
			const nullResult = some(null);
			const undefinedResult = some(undefined);

			expect(nullResult.tag).toBe("some");
			expect(nullResult.value).toBe(null);
			expect(undefinedResult.tag).toBe("some");
			expect(undefinedResult.value).toBe(undefined);
		});

		it("handles falsy values in some", () => {
			const zeroResult = some(0);
			const falseResult = some(false);
			const emptyStringResult = some("");

			expect(zeroResult.tag).toBe("some");
			expect(zeroResult.value).toBe(0);
			expect(falseResult.tag).toBe("some");
			expect(falseResult.value).toBe(false);
			expect(emptyStringResult.tag).toBe("some");
			expect(emptyStringResult.value).toBe("");
		});
	});
});
